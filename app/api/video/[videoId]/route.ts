import { NextRequest, NextResponse } from 'next/server'
import { getDb, isDatabaseConfigured } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

/**
 * GET /api/video/[videoId]
 *
 * Get a single video asset.
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
      v.*,
      a.name as source_asset_name,
      a.image_url as source_asset_image_url
    FROM video_assets v
    LEFT JOIN assets a ON v.source_asset_id = a.id
    WHERE v.id = ${videoId}
  `

  if (videos.length === 0) {
    return NextResponse.json({ error: 'Video not found' }, { status: 404 })
  }

  const video = videos[0]

  return NextResponse.json({
    id: video.id,
    clientId: video.client_id,
    sourceAssetId: video.source_asset_id,
    videoUrl: video.video_url,
    thumbnailUrl: video.thumbnail_url,
    durationSeconds: video.duration_seconds,
    resolution: video.resolution,
    aspectRatio: video.aspect_ratio,
    fps: video.fps,
    generationModel: video.generation_model,
    prompt: video.prompt,
    negativePrompt: video.negative_prompt,
    status: video.status,
    errorMessage: video.error_message,
    progress: video.progress,
    predictionId: video.prediction_id,
    cost: video.cost,
    createdAt: video.created_at,
    updatedAt: video.updated_at,
    completedAt: video.completed_at,
    sourceAssetName: video.source_asset_name,
    sourceAssetImageUrl: video.source_asset_image_url
  })
}

/**
 * DELETE /api/video/[videoId]
 *
 * Delete a video asset.
 */
export async function DELETE(
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

  // Check if video exists
  const videos = await db`
    SELECT id, status FROM video_assets WHERE id = ${videoId}
  `

  if (videos.length === 0) {
    return NextResponse.json({ error: 'Video not found' }, { status: 404 })
  }

  // Delete the video
  await db`DELETE FROM video_assets WHERE id = ${videoId}`

  return NextResponse.json({
    success: true,
    message: 'Video deleted'
  })
}
