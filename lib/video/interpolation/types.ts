// dashboard/lib/video/interpolation/types.ts

/**
 * Frame Interpolation Types
 *
 * Type definitions for frame interpolation service that increases
 * video FPS using FFmpeg's minterpolate filter.
 */

/**
 * Interpolation multiplier - how many times to increase the FPS
 * 2 = double (e.g., 30fps -> 60fps)
 * 4 = quadruple (e.g., 30fps -> 120fps)
 */
export type InterpolationMultiplier = 2 | 4;

/**
 * Quality setting for interpolation
 * 'standard' - Uses blend mode, faster but lower quality
 * 'high' - Uses MCI mode, slower but better motion handling
 */
export type InterpolationQuality = 'standard' | 'high';

/**
 * Parameters for frame interpolation
 */
export interface InterpolationParams {
  /** URL of the source video */
  videoUrl: string;
  /** Target frames per second */
  targetFps: number;
  /** Input video frames per second */
  inputFps: number;
  /** Duration of the video in seconds */
  durationSeconds: number;
  /** Quality setting (optional, defaults to 'standard') */
  quality?: InterpolationQuality;
}

/**
 * Status of an interpolation job
 */
export type InterpolationStatus =
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'cancelled';

/**
 * Result of starting or checking an interpolation job
 */
export interface InterpolationResult {
  /** Unique job identifier */
  jobId: string;
  /** Current job status */
  status: InterpolationStatus;
  /** URL of the output video (when succeeded) */
  outputUrl?: string;
  /** Progress percentage (0-100) */
  progress?: number;
  /** Error message (when failed) */
  error?: string;
  /** Output FPS of the interpolated video */
  outputFps?: number;
  /** Total processing time in seconds (when complete) */
  processingTimeSeconds?: number;
}

/**
 * Cost estimate for interpolation
 */
export interface InterpolationCostEstimate {
  /** Total cost amount */
  amount: number;
  /** Currency (always USD) */
  currency: 'USD';
  /** Cost breakdown */
  breakdown: {
    /** Base cost before multiplier */
    baseCost: number;
    /** Factor applied for 4x interpolation (1 for 2x, 2 for 4x) */
    multiplierFactor: number;
    /** The interpolation multiplier used (2 or 4) */
    interpolationMultiplier: InterpolationMultiplier;
  };
}

/**
 * Validation result for interpolation parameters
 */
export interface InterpolationValidation {
  /** Whether the parameters are valid */
  valid: boolean;
  /** List of validation error messages */
  errors: string[];
}
