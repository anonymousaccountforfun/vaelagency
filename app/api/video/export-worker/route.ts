/**
 * Export Worker API Route
 *
 * Triggers processing of pending export jobs.
 * This endpoint is designed to be called by a cron job.
 *
 * POST: Process pending export jobs (requires CRON_SECRET)
 * GET: Return worker status and pending job count
 */

import { NextRequest, NextResponse } from 'next/server';
import { isDatabaseConfigured } from '@/lib/db';
import {
  fetchPendingExportJobs,
  processAllPendingJobs,
} from '@/lib/video/export-worker';

/**
 * POST /api/video/export-worker
 *
 * Process pending export jobs.
 * Requires CRON_SECRET in Authorization header for security.
 *
 * Request:
 * - Authorization: Bearer {CRON_SECRET}
 * - Body (optional): { limit?: number }
 *
 * Response:
 * - processed: number - Total jobs processed
 * - succeeded: number - Jobs that completed successfully
 * - failed: number - Jobs that failed
 * - results: Array of job results
 */
export async function POST(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.warn('CRON_SECRET not configured - export worker endpoint is unprotected');
  } else {
    const providedSecret = authHeader?.replace('Bearer ', '');
    if (providedSecret !== cronSecret) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    );
  }

  try {
    // Parse request body for optional limit
    let limit = 10;
    try {
      const body = await request.json();
      if (body.limit && typeof body.limit === 'number' && body.limit > 0) {
        limit = Math.min(body.limit, 50); // Cap at 50 jobs per run
      }
    } catch {
      // No body or invalid JSON, use default limit
    }

    console.log(`Export worker triggered, processing up to ${limit} jobs`);

    const result = await processAllPendingJobs(limit);

    console.log(
      `Export worker completed: ${result.processed} processed, ` +
      `${result.succeeded} succeeded, ${result.failed} failed`
    );

    return NextResponse.json({
      processed: result.processed,
      succeeded: result.succeeded,
      failed: result.failed,
      results: result.results.map((r) => ({
        success: r.success,
        outputCount: r.outputs.length,
        error: r.error || null,
      })),
    });
  } catch (error) {
    console.error('Export worker error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * GET /api/video/export-worker
 *
 * Get worker status and pending job count.
 * Useful for monitoring the export queue.
 *
 * Response:
 * - status: 'ok' | 'error'
 * - pendingJobs: number
 * - timestamp: string
 */
export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      {
        status: 'error',
        error: 'Database not configured',
        pendingJobs: 0,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }

  try {
    // Get count of pending jobs (use a higher limit to get actual count)
    const pendingJobs = await fetchPendingExportJobs(100);

    return NextResponse.json({
      status: 'ok',
      pendingJobs: pendingJobs.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Export worker status error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        status: 'error',
        error: errorMessage,
        pendingJobs: 0,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
