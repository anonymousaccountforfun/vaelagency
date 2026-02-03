import { NextRequest, NextResponse } from 'next/server'
import { getDb, isDatabaseConfigured } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import type { VideoEditState } from '@/lib/video/edit-state'

/**
 * GET /api/video/[videoId]/edit
 *
 * Load edit state from video_assets.edit_state
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  const auth = await requireAuth()
  if (!auth.authorized) return auth.response

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  const db = getDb()
  if (!db) {
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
  }

  const { videoId } = await params

  const videos = await db`
    SELECT
      id,
      video_url,
      duration_seconds,
      resolution,
      aspect_ratio,
      fps,
      edit_state
    FROM video_assets
    WHERE id = ${videoId}
  `

  if (videos.length === 0) {
    return NextResponse.json({ error: 'Video not found' }, { status: 404 })
  }

  const video = videos[0]

  // Parse edit_state if it exists, otherwise return null
  let editState: VideoEditState | null = null
  if (video.edit_state) {
    try {
      editState = typeof video.edit_state === 'string'
        ? JSON.parse(video.edit_state)
        : video.edit_state
    } catch (parseError) {
      return NextResponse.json(
        {
          error: 'Invalid edit state data',
          videoId: video.id,
          details: parseError instanceof Error ? parseError.message : String(parseError),
        },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({
    videoId: video.id,
    videoUrl: video.video_url,
    durationSeconds: video.duration_seconds,
    resolution: video.resolution,
    aspectRatio: video.aspect_ratio,
    fps: video.fps,
    editState,
  })
}

/**
 * PUT /api/video/[videoId]/edit
 *
 * Save edit state to video_assets.edit_state
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  const auth = await requireAuth()
  if (!auth.authorized) return auth.response

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  const db = getDb()
  if (!db) {
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
  }

  const { videoId } = await params

  // Verify video exists
  const videos = await db`
    SELECT id FROM video_assets WHERE id = ${videoId}
  `

  if (videos.length === 0) {
    return NextResponse.json({ error: 'Video not found' }, { status: 404 })
  }

  try {
    const body = await request.json()
    const { editState } = body as { editState: VideoEditState }

    if (!editState) {
      return NextResponse.json({ error: 'editState is required' }, { status: 400 })
    }

    // Validate edit state version
    if (editState.version !== 1) {
      return NextResponse.json({ error: 'Invalid edit state version' }, { status: 400 })
    }

    // Save edit state as JSON
    const editStateJson = JSON.stringify(editState)

    await db`
      UPDATE video_assets
      SET
        edit_state = ${editStateJson}::jsonb,
        updated_at = NOW()
      WHERE id = ${videoId}
    `

    return NextResponse.json({
      success: true,
      message: 'Edit state saved',
      videoId,
    })
  } catch (error) {
    console.error('[PUT /api/video/[videoId]/edit] Error:', error)
    return NextResponse.json(
      { error: 'Failed to save edit state' },
      { status: 500 }
    )
  }
}
