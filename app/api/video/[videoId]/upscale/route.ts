import { NextRequest, NextResponse } from 'next/server'
import { getDb, isDatabaseConfigured } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { isReplicateConfigured } from '@/lib/replicate'
import { uploadFromUrl, isBlobConfigured, generateVideoPathname } from '@/lib/storage'

const REPLICATE_API_BASE = 'https://api.replicate.com/v1'

// Upscaling model - Real-ESRGAN for video
const UPSCALE_MODEL = {
  owner: 'lucataco',
  name: 'real-esrgan-video',
  costPer2x: 0.02, // per second of video
  costPer4x: 0.04
}

interface UpscaleRouteParams {
  params: Promise<{ videoId: string }>
}

/**
 * POST /api/video/[videoId]/upscale
 *
 * Upscale an existing video to higher resolution.
 *
 * Request body:
 * - factor: 2 | 4 (upscale factor)
 *
 * Response:
 * - success: boolean
 * - upscaledUrl: string
 * - factor: number
 */
export async function POST(request: NextRequest, { params }: UpscaleRouteParams) {
  const auth = await requireAuth()
  if (!auth.authorized) return auth.response

  const { videoId } = await params

  if (!isReplicateConfigured()) {
    return NextResponse.json(
      { error: 'Video upscaling not configured', code: 'UPSCALE_NOT_CONFIGURED' },
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
    const factor = body.factor === 4 ? 4 : 2 // Default to 2x

    // Get video record
    const videos = await db`
      SELECT id, client_id, video_url, duration_seconds, upscaled_url, upscale_factor
      FROM video_assets
      WHERE id = ${videoId}
    `

    if (videos.length === 0) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    const video = videos[0]

    if (!video.video_url) {
      return NextResponse.json(
        { error: 'Video has no URL - generation may still be in progress' },
        { status: 400 }
      )
    }

    // Check if already upscaled to this factor
    if (video.upscale_factor >= factor) {
      return NextResponse.json({
        success: true,
        upscaledUrl: video.upscaled_url,
        factor: video.upscale_factor,
        message: 'Video already upscaled to this factor or higher'
      })
    }

    // Create prediction for upscaling
    const apiToken = process.env.REPLICATE_API_TOKEN
    if (!apiToken) {
      return NextResponse.json({ error: 'Replicate API not configured' }, { status: 503 })
    }
    const modelPath = `${UPSCALE_MODEL.owner}/${UPSCALE_MODEL.name}`

    const response = await fetch(`${REPLICATE_API_BASE}/models/${modelPath}/predictions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait=120' // Wait up to 2 minutes for result
      },
      body: JSON.stringify({
        input: {
          video: video.video_url,
          scale: factor,
          face_enhance: false
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Upscale failed: ${response.status}`)
    }

    const prediction = await response.json()

    if (prediction.status === 'failed') {
      throw new Error(prediction.error || 'Upscale failed')
    }

    if (prediction.status !== 'succeeded' || !prediction.output) {
      // Still processing - return prediction ID for polling
      return NextResponse.json({
        success: true,
        status: 'processing',
        predictionId: prediction.id,
        message: 'Upscale in progress'
      }, { status: 202 })
    }

    const upscaledUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output

    // Upload to blob storage if configured
    let finalUrl = upscaledUrl
    if (isBlobConfigured()) {
      try {
        const pathname = generateVideoPathname(video.client_id, `${videoId}_${factor}x`, 'mp4')
        const uploadResult = await uploadFromUrl(upscaledUrl, pathname, { contentType: 'video/mp4' })
        finalUrl = uploadResult.url
      } catch {
        // Fall back to original URL if upload fails
      }
    }

    // Update database
    const duration = video.duration_seconds || 5
    const cost = factor === 4 ? UPSCALE_MODEL.costPer4x * duration : UPSCALE_MODEL.costPer2x * duration

    await db`
      UPDATE video_assets
      SET upscaled_url = ${finalUrl}, upscale_factor = ${factor}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${videoId}
    `

    // Log cost
    await db`
      INSERT INTO generations (asset_id, model, prompt, size, quality, cost, image_url)
      VALUES (${null}, ${'real-esrgan-video'}, ${'upscale'}, ${`${factor}x`}, ${'upscale'}, ${cost}, ${finalUrl})
    `

    return NextResponse.json({
      success: true,
      upscaledUrl: finalUrl,
      factor,
      cost
    })

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upscale failed' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/video/[videoId]/upscale
 *
 * Get upscale status for a video.
 */
export async function GET(request: NextRequest, { params }: UpscaleRouteParams) {
  const auth = await requireAuth()
  if (!auth.authorized) return auth.response

  const { videoId } = await params

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  const db = getDb()
  if (!db) {
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
  }

  const videos = await db`
    SELECT id, video_url, upscaled_url, upscale_factor, duration_seconds
    FROM video_assets
    WHERE id = ${videoId}
  `

  if (videos.length === 0) {
    return NextResponse.json({ error: 'Video not found' }, { status: 404 })
  }

  const video = videos[0]

  return NextResponse.json({
    videoId,
    hasUpscale: !!video.upscaled_url,
    upscaledUrl: video.upscaled_url,
    currentFactor: video.upscale_factor || 1,
    availableFactors: [2, 4],
    estimatedCost2x: UPSCALE_MODEL.costPer2x * (video.duration_seconds || 5),
    estimatedCost4x: UPSCALE_MODEL.costPer4x * (video.duration_seconds || 5)
  })
}
