// dashboard/lib/video/interpolation/service.ts

/**
 * Frame Interpolation Service
 *
 * Provides frame interpolation capabilities to increase video FPS
 * using FFmpeg's minterpolate filter.
 */

import type {
  InterpolationParams,
  InterpolationResult,
  InterpolationCostEstimate,
  InterpolationValidation,
  InterpolationMultiplier,
} from './types';

/**
 * Base cost per second of video for interpolation
 */
const BASE_COST_PER_SECOND = 0.005;

/**
 * Maximum allowed video duration in seconds
 */
const MAX_DURATION_SECONDS = 120;

/**
 * Cost multiplier for 4x interpolation (more compute intensive)
 */
const FOUR_X_COST_FACTOR = 2;

/**
 * Frame Interpolation Service
 *
 * Handles frame interpolation to increase video smoothness
 * by generating intermediate frames between existing frames.
 */
export class FrameInterpolationService {
  /**
   * Get the interpolation multiplier based on input and target FPS
   *
   * @param inputFps - Source video FPS
   * @param targetFps - Desired output FPS
   * @returns 2 or 4 depending on the ratio
   */
  getMultiplier(inputFps: number, targetFps: number): InterpolationMultiplier {
    const ratio = targetFps / inputFps;

    // If ratio is closer to 4 than to 2, use 4x
    // Threshold is 3 (midpoint between 2 and 4)
    if (ratio >= 3) {
      return 4;
    }

    return 2;
  }

  /**
   * Validate interpolation parameters
   *
   * @param params - Interpolation parameters to validate
   * @returns Validation result with any errors
   */
  validateParams(params: InterpolationParams): InterpolationValidation {
    const errors: string[] = [];

    // Check URL validity
    if (!this.isValidUrl(params.videoUrl)) {
      errors.push('Invalid video URL');
    }

    // Check FPS relationship
    if (params.targetFps <= params.inputFps) {
      errors.push('Target FPS must be greater than input FPS');
    }

    // Check duration limit
    if (params.durationSeconds > MAX_DURATION_SECONDS) {
      errors.push('Video duration must be 120 seconds or less');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Estimate the cost of interpolation
   *
   * @param params - Interpolation parameters
   * @returns Cost estimate with breakdown
   */
  estimateCost(params: InterpolationParams): InterpolationCostEstimate {
    const multiplier = this.getMultiplier(params.inputFps, params.targetFps);
    const baseCost = params.durationSeconds * BASE_COST_PER_SECOND;

    // 4x interpolation costs more due to additional computation
    const multiplierFactor = multiplier === 4 ? FOUR_X_COST_FACTOR : 1;
    const totalCost = baseCost * multiplierFactor;

    return {
      amount: Number(totalCost.toFixed(2)),
      currency: 'USD',
      breakdown: {
        baseCost: Number(baseCost.toFixed(2)),
        multiplierFactor,
        interpolationMultiplier: multiplier,
      },
    };
  }

  /**
   * Build the FFmpeg command for frame interpolation
   *
   * @param inputPath - Path to input video file
   * @param outputPath - Path for output video file
   * @param params - Interpolation parameters
   * @returns FFmpeg command string
   */
  buildFfmpegCommand(
    inputPath: string,
    outputPath: string,
    params: InterpolationParams
  ): string {
    const quality = params.quality || 'standard';

    // minterpolate filter modes:
    // - blend: Simple blending, faster but lower quality
    // - mci: Motion Compensated Interpolation, slower but better quality
    const miMode = quality === 'high' ? 'mci' : 'blend';

    // Build the minterpolate filter with appropriate settings
    const minterpolateFilter = `minterpolate=fps=${params.targetFps}:mi_mode=${miMode}`;

    // Construct the full FFmpeg command
    const command = [
      'ffmpeg',
      `-i ${inputPath}`,
      `-vf "${minterpolateFilter}"`,
      '-c:a copy', // Copy audio without re-encoding
      '-y', // Overwrite output if exists
      outputPath,
    ].join(' ');

    return command;
  }

  /**
   * Start an interpolation job
   *
   * Note: This is a stub implementation that returns a pending job.
   * In production, this would submit the job to a processing queue.
   *
   * @param params - Interpolation parameters
   * @returns Promise resolving to job result
   */
  async startInterpolation(params: InterpolationParams): Promise<InterpolationResult> {
    // Validate parameters first
    const validation = this.validateParams(params);
    if (!validation.valid) {
      throw new Error(`Invalid parameters: ${validation.errors.join(', ')}`);
    }

    // Generate a unique job ID
    const jobId = this.generateJobId();

    // In production, this would:
    // 1. Download the video
    // 2. Submit to a processing queue
    // 3. Return the job ID for status tracking

    return {
      jobId,
      status: 'pending',
      outputFps: params.targetFps,
      progress: 0,
    };
  }

  /**
   * Check the status of an interpolation job
   *
   * Note: This is a stub implementation that always returns pending.
   * In production, this would query the job status from the processing system.
   *
   * @param jobId - Job ID to check
   * @returns Promise resolving to job status
   */
  async checkStatus(jobId: string): Promise<InterpolationResult> {
    // In production, this would:
    // 1. Query the processing queue for job status
    // 2. Return progress, completion status, or error

    // Stub: always return pending
    return {
      jobId,
      status: 'pending',
      progress: 0,
    };
  }

  /**
   * Check if a string is a valid URL
   */
  private isValidUrl(url: string): boolean {
    if (!url || url.trim() === '') {
      return false;
    }

    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate a unique job ID
   */
  private generateJobId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 10);
    return `interp-${timestamp}-${random}`;
  }
}

/**
 * Singleton instance of the Frame Interpolation Service
 */
export const frameInterpolationService = new FrameInterpolationService();
