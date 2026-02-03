// dashboard/lib/video/types.ts

/**
 * Video Provider Abstraction Layer Types
 *
 * Defines interfaces for multi-provider video generation.
 */

// Supported video providers
export type VideoProviderId = 'replicate' | 'luma' | 'kling' | 'runway' | 'pika' | 'sora' | 'veo';

/**
 * Video status constants for consistent usage across the codebase
 */
export const VIDEO_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;

// Generation status
export type VideoJobStatus = typeof VIDEO_STATUS[keyof typeof VIDEO_STATUS];

// Model configuration
export interface VideoModelConfig {
  id: string;
  providerId: VideoProviderId;
  name: string;
  displayName: string;
  description: string;
  costPerSecond: number;
  defaultDuration: number;
  maxDuration: number;
  supportsImageToVideo: boolean;
  supportsCharacterRef: boolean;
  supportsKeyframes: boolean;
  aspectRatios: readonly string[];
  qualityTier: 'budget' | 'standard' | 'premium';
  bestFor: string[];
}

// Provider capabilities
export interface ProviderCapabilities {
  textToVideo: boolean;
  imageToVideo: boolean;
  videoToVideo: boolean;
  characterReference: boolean;
  keyframes: boolean;
  lipSync: boolean;
}

// Generation parameters
export interface VideoGenerateParams {
  prompt: string;
  negativePrompt?: string;
  model: string;
  duration: number;
  aspectRatio: string;
  resolution?: string;
  startImage?: string;
  endImage?: string;
  referenceImages?: string[];
  seed?: number;
  // Brand context
  clientId?: string;
  applyBrandPresets?: boolean;
}

// Job result (returned immediately)
export interface VideoJobResult {
  jobId: string;
  providerId: VideoProviderId;
  model: string;
  status: VideoJobStatus;
  estimatedCost: number;
  estimatedDuration: number;
}

// Status check result
export interface VideoStatusResult {
  status: VideoJobStatus;
  progress?: number;
  videoUrl?: string;
  thumbnailUrl?: string;
  error?: string;
  actualCost?: number;
}

// Cost estimate
export interface VideoCostEstimate {
  amount: number;
  currency: 'USD';
  breakdown: {
    baseCost: number;
    durationMultiplier: number;
    qualityMultiplier: number;
  };
}

// Provider health status
export interface ProviderHealthStatus {
  available: boolean;
  latency?: number;
  queueDepth?: number;
  message?: string;
}

// Provider interface
export interface VideoProvider {
  id: VideoProviderId;
  name: string;
  models: VideoModelConfig[];
  capabilities: ProviderCapabilities;

  // Operations
  generate(params: VideoGenerateParams): Promise<VideoJobResult>;
  checkStatus(jobId: string): Promise<VideoStatusResult>;
  cancel(jobId: string): Promise<void>;

  // Cost
  estimateCost(params: VideoGenerateParams): VideoCostEstimate;

  // Health
  isConfigured(): boolean;
  healthCheck(): Promise<ProviderHealthStatus>;
}

// Provider selection result
export interface ProviderSelection {
  provider: VideoProvider;
  model: VideoModelConfig;
  reason: string;
}

// Fallback chain configuration
export interface FallbackConfig {
  primaryModel: string;
  fallbacks: string[];
  maxRetries: number;
}
