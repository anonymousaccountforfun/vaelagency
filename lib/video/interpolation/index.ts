// dashboard/lib/video/interpolation/index.ts

/**
 * Frame Interpolation Module
 *
 * Exports types and service for video frame interpolation.
 */

// Types
export type {
  InterpolationMultiplier,
  InterpolationQuality,
  InterpolationParams,
  InterpolationStatus,
  InterpolationResult,
  InterpolationCostEstimate,
  InterpolationValidation,
} from './types';

// Service
export {
  FrameInterpolationService,
  frameInterpolationService,
} from './service';
