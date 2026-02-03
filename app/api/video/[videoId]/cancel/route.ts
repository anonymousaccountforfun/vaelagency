import { NextRequest, NextResponse } from 'next/server'
import { getDb, isDatabaseConfigured } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { VIDEO_MODELS, VideoModel } from '@/lib/video'
import { VIDEO_STATUS } from '@/lib/video/types'

const REPLICATE_API_BASE = 'https://api.replicate.com/v1'

/**
 * POST /api/video/[videoId]/cancel
 *
 * Cancel a video generation in progress.
 *
 * Returns:
 * - success: boolean
 * - refunded: number (estimated cost saved by cancelling)
 * - status: 'cancelled' | 'already_complete' | 'already_failed' | 'already_cancelled'
 */
export async function POST(
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

  // Get video record
  const videos = await db`
    SELECT
      id, client_id, status, prediction_id, generation_model,
      duration_seconds, progress, cost
    FROM video_assets
    WHERE id = ${videoId}
  `

  if (videos.length === 0) {
    return NextResponse.json({ error: 'Video not found' }, { status: 404 })
  }

  const video = videos[0]
  const currentStatus = video.status as string
  const predictionId = video.prediction_id as string | null

  // Check if already in a terminal state
  if (currentStatus === VIDEO_STATUS.SUCCEEDED || currentStatus === 'complete') {
    return NextResponse.json({
      success: false,
      status: 'already_complete',
      message: 'Video generation already completed'
    })
  }

  if (currentStatus === VIDEO_STATUS.FAILED) {
    return NextResponse.json({
      success: false,
      status: 'already_failed',
      message: 'Video generation already failed'
    })
  }

  if (currentStatus === VIDEO_STATUS.CANCELLED) {
    return NextResponse.json({
      success: false,
      status: 'already_cancelled',
      message: 'Video generation already cancelled'
    })
  }

  // Cancel the Replicate prediction if we have one
  let replicateCancelled = false
  if (predictionId) {
    try {
      const apiToken = process.env.REPLICATE_API_TOKEN
      if (apiToken) {
        const response = await fetch(
          `${REPLICATE_API_BASE}/predictions/${predictionId}/cancel`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiToken}`,
              'Content-Type': 'application/json'
            }
          }
        )

        if (response.ok) {
          replicateCancelled = true
        }
      }
    } catch (error) {
      // Log cancellation errors but still mark video as cancelled
      console.error('[POST /api/video/[videoId]/cancel] Failed to cancel with provider:', {
        videoId,
        predictionId,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  // Calculate estimated refund based on progress
  let refunded = 0
  const model = video.generation_model as VideoModel
  const duration = (video.duration_seconds as number) || 5
  const progress = (video.progress as number) || 0

  if (model && VIDEO_MODELS[model]) {
    const modelConfig = VIDEO_MODELS[model]
    const totalCost = modelConfig.costPerSecond * duration
    // Refund is estimated based on remaining progress
    // Note: Actual billing may vary - this is an estimate
    refunded = totalCost * (1 - progress / 100)
  }

  // Update video record to cancelled
  await db`
    UPDATE video_assets
    SET
      status = ${VIDEO_STATUS.CANCELLED},
      error_message = 'Cancelled by user',
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${videoId}
  `

  return NextResponse.json({
    success: true,
    status: VIDEO_STATUS.CANCELLED,
    replicateCancelled,
    refunded: Math.round(refunded * 10000) / 10000, // Round to 4 decimal places
    message: 'Video generation cancelled'
  })
}
