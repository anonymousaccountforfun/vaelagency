// dashboard/app/api/video/[videoId]/status/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getVideoStatus } from '@/lib/video';
import { getVideoJob, updateVideoJobStatus } from '@/lib/db/video';

/**
 * GET /api/video/[videoId]/status
 * Get status of a video generation job
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  const auth = await requireAuth();
  if (!auth.authorized) return auth.response;

  try {
    const { videoId } = await params;

    // Get job from database
    const job = await getVideoJob(videoId);
    if (!job) {
      return NextResponse.json(
        { error: 'Video job not found' },
        { status: 404 }
      );
    }

    // If already complete, return cached status
    if (job.status === 'succeeded' || job.status === 'failed' || job.status === 'cancelled') {
      return NextResponse.json({
        jobId: job.id,
        status: job.status,
        progress: job.progress,
        videoUrl: job.video_url,
        thumbnailUrl: job.thumbnail_url,
        error: job.error_message,
        duration: job.duration_seconds,
        cost: job.actual_cost || job.estimated_cost,
      });
    }

    // Check status with provider
    const externalJobId = job.external_job_id || job.id;

    const providerStatus = await getVideoStatus(externalJobId);

    // Map provider status to DB status
    const mapStatus = (s: string): 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled' => {
      if (s === 'starting') return 'pending';
      if (s === 'canceled') return 'cancelled';
      return s as 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled';
    };
    const dbStatus = mapStatus(providerStatus.status);

    // Update database with new status
    if (dbStatus !== job.status || providerStatus.videoUrl) {
      await updateVideoJobStatus(job.id, dbStatus, {
        progress: providerStatus.progress ? parseInt(providerStatus.progress, 10) : undefined,
        errorMessage: providerStatus.error,
        videoUrl: providerStatus.videoUrl,
      });
    }

    return NextResponse.json({
      jobId: job.id,
      status: dbStatus,
      progress: providerStatus.progress,
      videoUrl: providerStatus.videoUrl,
      error: providerStatus.error,
      estimatedCost: job.estimated_cost,
    });
  } catch (error) {
    console.error('[GET /api/video/[videoId]/status] Error:', error);
    return NextResponse.json(
      { error: 'Failed to check video status' },
      { status: 500 }
    );
  }
}
