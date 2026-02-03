import { NextRequest, NextResponse } from 'next/server'
import { after } from 'next/server'
import { getDb, isDatabaseConfigured } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import {
  isVideoConfigured,
  estimateVideoCost,
  startVideoGeneration,
  startImageToVideo,
  VideoModel,
  VIDEO_MODELS
} from '@/lib/video'
import { nanoid } from 'nanoid'

// Rate limiting: 5 batches per 10 minutes per user
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000 // 10 minutes
const rateLimitStore = new Map<string, { count: number; windowStart: number }>()

/**
 * POST /api/video/batch
 *
 * Generate multiple videos in batch.
 *
 * Request body:
 * - videos: Array of video requests (max 10)
 *   Each request:
 *   - clientId: string (required)
 *   - prompt: string (required)
 *   - imageUrl?: string (for image-to-video)
 *   - model?: VideoModel
 *   - aspectRatio?: '16:9' | '9:16' | '1:1'
 *   - duration?: number
 *
 * Response:
 * - success: boolean
 * - jobs: Array of { videoId, predictionId, estimatedCost, estimatedTime }
 * - totalEstimatedCost: number
 */
export async function POST(request: NextRequest) {
  const auth = await requireAuth()
  if (!auth.authorized) return auth.response

  // Rate limiting check
  const userId = auth.session?.user?.id || 'anonymous'
  const now = Date.now()
  const userRateLimit = rateLimitStore.get(userId)

  if (userRateLimit) {
    // Check if we're still in the same window
    if (now - userRateLimit.windowStart < RATE_LIMIT_WINDOW_MS) {
      if (userRateLimit.count >= RATE_LIMIT_MAX) {
        const retryAfter = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - userRateLimit.windowStart)) / 1000)
        return NextResponse.json(
          {
            error: 'Rate limit exceeded',
            code: 'RATE_LIMIT_EXCEEDED',
            limit: RATE_LIMIT_MAX,
            window: '10 minutes',
            retryAfter,
          },
          { status: 429 }
        )
      }
      userRateLimit.count++
    } else {
      // Reset window
      userRateLimit.windowStart = now
      userRateLimit.count = 1
    }
  } else {
    rateLimitStore.set(userId, { count: 1, windowStart: now })
  }

  if (!isVideoConfigured()) {
    return NextResponse.json(
      { error: 'Video generation not configured', code: 'VIDEO_NOT_CONFIGURED' },
      { status: 503 }
    )
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  const db = getDb()
  if (!db) {
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
  }

  try {
    const body = await request.json()
    const { videos } = body

    if (!Array.isArray(videos) || videos.length === 0) {
      return NextResponse.json({ error: 'videos array is required' }, { status: 400 })
    }

    if (videos.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 videos per batch', code: 'BATCH_LIMIT_EXCEEDED' },
        { status: 400 }
      )
    }

    const jobs = []
    const errors: { index: number; clientId?: string; error: string }[] = []
    let totalEstimatedCost = 0

    for (let i = 0; i < videos.length; i++) {
      const videoRequest = videos[i]
      const {
        clientId,
        prompt,
        imageUrl,
        model = 'minimax-video',
        aspectRatio = '16:9',
        duration = 5
      } = videoRequest

      if (!clientId || !prompt) {
        errors.push({ index: i, clientId, error: 'Missing required field: clientId or prompt' })
        continue
      }

      // Validate model
      if (!(model in VIDEO_MODELS)) {
        errors.push({ index: i, clientId, error: `Invalid model: ${model}` })
        continue
      }

      const videoId = `video_${nanoid(12)}`

      try {
        // Start generation (async)
        const job = imageUrl
          ? await startImageToVideo({ imageUrl, prompt, model, aspectRatio, duration })
          : await startVideoGeneration({ prompt, model, aspectRatio, duration })

        // Create video asset record
        await db`
          INSERT INTO video_assets (
            id, client_id, prompt, generation_model,
            aspect_ratio, duration_seconds, status, prediction_id,
            progress, queued_at, created_at
          ) VALUES (
            ${videoId},
            ${clientId},
            ${prompt},
            ${model},
            ${aspectRatio},
            ${job.duration},
            'queued',
            ${job.predictionId},
            ${0},
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          )
        `

        jobs.push({
          videoId,
          predictionId: job.predictionId,
          model: job.model,
          modelDisplayName: job.modelDisplayName,
          estimatedCost: job.estimatedCost,
          estimatedTime: job.estimatedTime
        })

        totalEstimatedCost += job.estimatedCost
      } catch (err) {
        errors.push({
          index: i,
          clientId,
          error: err instanceof Error ? err.message : 'Generation failed'
        })
      }
    }

    if (jobs.length === 0) {
      return NextResponse.json(
        { error: 'No valid video requests in batch', errors },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      jobs,
      totalEstimatedCost,
      message: `Started ${jobs.length} of ${videos.length} generations`,
      ...(errors.length > 0 && { errors })
    }, { status: 202 })

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Batch generation failed' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/video/batch
 *
 * Get batch generation limits and options.
 */
export async function GET() {
  return NextResponse.json({
    maxBatchSize: 10,
    availableModels: Object.keys(VIDEO_MODELS),
    configured: isVideoConfigured()
  })
}
