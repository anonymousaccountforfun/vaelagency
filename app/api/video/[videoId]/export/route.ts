/**
 * Video Export Processing Flow
 *
 * This route handles export job creation. The actual video processing happens
 * asynchronously via a background worker (not implemented in this file).
 *
 * Expected processing flow:
 * 1. Client POSTs to this endpoint with editState and output configurations
 * 2. This route validates the request and creates an export job record in video_jobs table
 * 3. Job is created with status='pending'
 * 4. A background worker polls video_jobs for pending export jobs
 * 5. Worker processes each job using FFmpeg with the editState (see lib/video/export.ts)
 * 6. Worker updates job status to 'processing', then 'completed' or 'failed'
 * 7. Client polls GET /api/video/[videoId]/export to check job status
 *
 * TODO: Implement background worker for processing export jobs.
 * See buildFFmpegFilterComplex() in lib/video/export.ts for FFmpeg filter generation.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getDb, isDatabaseConfigured } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import {
  createExportJob,
  ExportRequest,
  ExportJob,
} from '@/lib/video/export'
import { VideoEditState, validateEditState, OutputSettings } from '@/lib/video/edit-state'

/**
 * POST /api/video/[videoId]/export
 *
 * Start a video export job.
 *
 * Request body:
 * - editState: VideoEditState (required) - The edit state to export
 * - outputs: Array<{ aspectRatio, resolution, format }> (required) - Output configurations
 * - clientId: string (required) - Client ID that owns the video
 * - namingPattern: string (optional) - Filename pattern (default: {clientId}_{videoId}_{aspectRatio}_{resolution})
 *
 * Response:
 * - exportId: string - The export job ID
 * - outputs: ExportOutput[] - Output configurations with filenames
 * - status: string - Job status (pending)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  const auth = await requireAuth()
  if (!auth.authorized) return auth.response

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    )
  }

  const db = getDb()
  if (!db) {
    return NextResponse.json(
      { error: 'Database connection failed' },
      { status: 500 }
    )
  }

  const { videoId } = await params

  try {
    const body = await request.json()
    const { editState, outputs, clientId, namingPattern } = body

    // Validate required fields
    if (!clientId) {
      return NextResponse.json(
        { error: 'Missing clientId' },
        { status: 400 }
      )
    }

    if (!editState) {
      return NextResponse.json(
        {
          error: 'Missing editState',
          suggestion: 'Provide the video edit state containing trim, layers, and output settings.',
        },
        { status: 400 }
      )
    }

    if (!outputs || !Array.isArray(outputs) || outputs.length === 0) {
      return NextResponse.json(
        {
          error: 'Missing or empty outputs array',
          suggestion: 'Provide at least one output configuration with aspectRatio, resolution, and format.',
        },
        { status: 400 }
      )
    }

    // Validate edit state
    const editStateTyped = editState as VideoEditState
    const validationErrors = validateEditState(editStateTyped)
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          error: 'Invalid edit state',
          details: validationErrors,
        },
        { status: 400 }
      )
    }

    // Validate output configurations
    const validAspectRatios: OutputSettings['aspectRatio'][] = ['16:9', '9:16', '1:1', '4:5']
    const validResolutions: OutputSettings['resolution'][] = ['1080p', '720p', '480p']
    const validFormats: OutputSettings['format'][] = ['mp4', 'mov', 'webm']

    for (let i = 0; i < outputs.length; i++) {
      const output = outputs[i]

      if (!validAspectRatios.includes(output.aspectRatio)) {
        return NextResponse.json(
          {
            error: `Invalid aspectRatio in output ${i + 1}`,
            valid: validAspectRatios,
          },
          { status: 400 }
        )
      }

      if (!validResolutions.includes(output.resolution)) {
        return NextResponse.json(
          {
            error: `Invalid resolution in output ${i + 1}`,
            valid: validResolutions,
          },
          { status: 400 }
        )
      }

      if (!validFormats.includes(output.format)) {
        return NextResponse.json(
          {
            error: `Invalid format in output ${i + 1}`,
            valid: validFormats,
          },
          { status: 400 }
        )
      }
    }

    // Verify video exists and belongs to client
    const videos = await db`
      SELECT id, client_id, video_url, status
      FROM video_assets
      WHERE id = ${videoId} AND client_id = ${clientId}
    `

    if (videos.length === 0) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      )
    }

    const video = videos[0]

    if (video.status !== 'completed' && video.status !== 'succeeded') {
      return NextResponse.json(
        {
          error: 'Video not ready for export',
          currentStatus: video.status,
          suggestion: 'Wait for video generation to complete before exporting.',
        },
        { status: 400 }
      )
    }

    if (!video.video_url) {
      return NextResponse.json(
        {
          error: 'Video has no URL',
          suggestion: 'The video may still be processing.',
        },
        { status: 400 }
      )
    }

    // Create export job
    const exportRequest: ExportRequest = {
      videoId,
      editState: editStateTyped,
      outputs,
      clientId,
      namingPattern,
    }

    const job: ExportJob = createExportJob(exportRequest)

    // Store job in video_jobs table
    await db`
      INSERT INTO video_jobs (
        id,
        video_id,
        client_id,
        provider,
        model,
        status,
        progress,
        metadata,
        created_at
      ) VALUES (
        ${job.id},
        ${videoId},
        ${clientId},
        'export',
        'ffmpeg',
        ${job.status},
        ${job.progress},
        ${JSON.stringify({
          editState: job.editState,
          outputs: job.outputs,
          namingPattern: namingPattern || null,
        })},
        ${job.createdAt}
      )
    `

    console.log(`Export job ${job.id} created for video ${videoId} with ${job.outputs.length} outputs`)

    return NextResponse.json({
      exportId: job.id,
      videoId,
      outputs: job.outputs.map(o => ({
        aspectRatio: o.aspectRatio,
        resolution: o.resolution,
        format: o.format,
        filename: o.filename,
        width: o.width,
        height: o.height,
      })),
      status: job.status,
      createdAt: job.createdAt.toISOString(),
    })
  } catch (error) {
    console.error('Export job creation error:', error)

    const errorMessage = error instanceof Error ? error.message : 'Export failed'

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

/**
 * GET /api/video/[videoId]/export
 *
 * List export jobs for a video.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  const auth = await requireAuth()
  if (!auth.authorized) return auth.response

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    )
  }

  const db = getDb()
  if (!db) {
    return NextResponse.json(
      { error: 'Database connection failed' },
      { status: 500 }
    )
  }

  const { videoId } = await params
  const { searchParams } = new URL(request.url)
  const clientId = searchParams.get('clientId')

  if (!clientId) {
    return NextResponse.json(
      { error: 'Missing clientId query parameter' },
      { status: 400 }
    )
  }

  const jobs = await db`
    SELECT
      id,
      video_id,
      client_id,
      status,
      progress,
      error_message,
      metadata,
      created_at,
      started_at,
      completed_at
    FROM video_jobs
    WHERE video_id = ${videoId}
      AND client_id = ${clientId}
      AND provider = 'export'
    ORDER BY created_at DESC
    LIMIT 20
  `

  return NextResponse.json({
    videoId,
    jobs: jobs.map(job => ({
      id: job.id,
      status: job.status,
      progress: job.progress,
      error: job.error_message,
      outputs: job.metadata?.outputs || [],
      createdAt: job.created_at,
      startedAt: job.started_at,
      completedAt: job.completed_at,
    })),
  })
}
