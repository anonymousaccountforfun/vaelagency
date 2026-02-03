import { NextRequest, NextResponse } from 'next/server';
import { frameInterpolationService } from '@/lib/video/interpolation';
import type { InterpolationQuality, InterpolationMultiplier } from '@/lib/video/interpolation';

interface RouteContext {
  params: Promise<{ videoId: string }>;
}

/**
 * POST /api/video/[videoId]/interpolate
 *
 * Start a frame interpolation job for a video.
 *
 * Body:
 * - multiplier: 2 | 4 (required) - Frame rate multiplier
 * - quality: 'standard' | 'high' (optional, default 'standard')
 *
 * Response:
 * - jobId: Unique job identifier
 * - videoId: The video being processed
 * - multiplier: The frame rate multiplier used
 * - quality: The quality setting used
 * - status: Job status (pending)
 * - estimatedCost: Cost estimate with breakdown
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { videoId } = await context.params;
    const body = await request.json();

    // Validate required fields
    if (!body.multiplier) {
      return NextResponse.json(
        { error: 'multiplier is required' },
        { status: 400 }
      );
    }

    const multiplier = body.multiplier as InterpolationMultiplier;
    const quality: InterpolationQuality = body.quality || 'standard';

    // Build params for validation and cost estimation
    // Note: In production, these values would come from the video metadata
    const params = {
      videoUrl: `https://storage.example.com/videos/${videoId}`,
      inputFps: multiplier === 2 ? 30 : 30, // Default assumption
      targetFps: multiplier === 2 ? 60 : 120,
      durationSeconds: 10, // Default assumption for cost estimate
      quality,
    };

    // Validate parameters
    const validation = frameInterpolationService.validateParams(params);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.errors.join(', ') },
        { status: 400 }
      );
    }

    // Estimate cost
    const estimatedCost = frameInterpolationService.estimateCost(params);

    // Generate job ID (in production, this would create a database record and queue the job)
    const jobId = `interp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    return NextResponse.json({
      jobId,
      videoId,
      multiplier,
      quality,
      status: 'pending',
      estimatedCost,
    });
  } catch (error) {
    console.error('[Interpolate API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to start interpolation job' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/video/[videoId]/interpolate?jobId=xxx
 *
 * Get the status of an interpolation job.
 *
 * Query params:
 * - jobId: The job ID to check (required)
 *
 * Response:
 * - jobId: The job identifier
 * - videoId: The video being processed
 * - status: Current job status
 * - progress: Progress percentage (0-100)
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { videoId } = await context.params;
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { error: 'jobId query parameter is required' },
        { status: 400 }
      );
    }

    // In production, this would fetch from database
    // For now, return mock status
    return NextResponse.json({
      jobId,
      videoId,
      status: 'processing',
      progress: 50,
    });
  } catch (error) {
    console.error('[Interpolate API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get job status' },
      { status: 500 }
    );
  }
}
