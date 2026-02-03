// dashboard/lib/video/providers/sora.ts

/**
 * OpenAI Sora Video Generation Provider
 *
 * Known for high-quality video generation with support for text-to-video,
 * image-to-video, video remix, and lip sync capabilities.
 */

import type {
  VideoProvider,
  VideoProviderId,
  VideoModelConfig,
  ProviderCapabilities,
  VideoGenerateParams,
  VideoJobResult,
  VideoStatusResult,
  VideoCostEstimate,
  ProviderHealthStatus,
} from '../types';

// Valid durations for Sora: 4, 8, or 12 seconds only
const VALID_DURATIONS = [4, 8, 12] as const;

/**
 * Normalize duration to nearest valid Sora duration (4, 8, or 12)
 * Values above max (12) are capped at 12
 */
function normalizeDuration(duration: number): number {
  // Cap at max duration
  if (duration > 12) {
    return 12;
  }

  // Find nearest valid duration
  let nearest: (typeof VALID_DURATIONS)[number] = VALID_DURATIONS[0];
  let minDiff = Math.abs(duration - nearest);

  for (const valid of VALID_DURATIONS) {
    const diff = Math.abs(duration - valid);
    // Use <= to round up when equidistant (e.g., 6 -> 8)
    if (diff < minDiff || (diff === minDiff && valid > nearest)) {
      minDiff = diff;
      nearest = valid;
    }
  }

  return nearest;
}

/**
 * OpenAI Sora model configurations
 */
export const SORA_MODELS: VideoModelConfig[] = [
  {
    id: 'sora-2',
    providerId: 'sora',
    name: 'sora-2',
    displayName: 'Sora 2',
    description: 'Standard Sora model for high-quality video generation',
    costPerSecond: 0.10,
    defaultDuration: 8,
    maxDuration: 12,
    supportsImageToVideo: true,
    supportsCharacterRef: false,
    supportsKeyframes: false,
    aspectRatios: ['16:9', '9:16', '1:1'] as const,
    qualityTier: 'standard',
    bestFor: ['marketing videos', 'social content', 'product demos'],
  },
  {
    id: 'sora-2-pro',
    providerId: 'sora',
    name: 'sora-2-pro',
    displayName: 'Sora 2 Pro',
    description: 'Premium Sora model with enhanced quality and detail',
    costPerSecond: 0.25,
    defaultDuration: 8,
    maxDuration: 12,
    supportsImageToVideo: true,
    supportsCharacterRef: false,
    supportsKeyframes: false,
    aspectRatios: ['16:9', '9:16', '1:1'] as const,
    qualityTier: 'premium',
    bestFor: ['cinematic content', 'high-end ads', 'brand videos'],
  },
];

const SORA_API_BASE = 'https://api.openai.com/v1';

export class SoraProvider implements VideoProvider {
  id: VideoProviderId = 'sora';
  name = 'OpenAI Sora';
  models = SORA_MODELS;

  capabilities: ProviderCapabilities = {
    textToVideo: true,
    imageToVideo: true,
    videoToVideo: true,
    characterReference: false,
    keyframes: false,
    lipSync: true,
  };

  private getApiKey(): string | undefined {
    return process.env.OPENAI_API_KEY;
  }

  isConfigured(): boolean {
    const key = this.getApiKey();
    return !!key && key.length > 0;
  }

  private getModel(modelId: string): VideoModelConfig {
    const model = this.models.find((m) => m.id === modelId);
    if (!model) {
      throw new Error(`[Sora] Unknown model: ${modelId}`);
    }
    return model;
  }

  estimateCost(params: VideoGenerateParams): VideoCostEstimate {
    const model = this.getModel(params.model);
    const normalizedDuration = normalizeDuration(params.duration);
    const baseCost = model.costPerSecond * normalizedDuration;

    // Quality multiplier: 1.5x for premium tier
    const qualityMultiplier = model.qualityTier === 'premium' ? 1.5 : 1.0;

    return {
      amount: baseCost * qualityMultiplier,
      currency: 'USD',
      breakdown: {
        baseCost,
        durationMultiplier: normalizedDuration / model.defaultDuration,
        qualityMultiplier,
      },
    };
  }

  async healthCheck(): Promise<ProviderHealthStatus> {
    if (!this.isConfigured()) {
      return {
        available: false,
        message: '[Sora] API key not configured',
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const startTime = Date.now();
      const response = await fetch(`${SORA_API_BASE}/models`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.getApiKey()}`,
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const latency = Date.now() - startTime;

      if (!response.ok) {
        return {
          available: false,
          latency,
          message: `[Sora] Health check failed: ${response.status}`,
        };
      }

      return {
        available: true,
        latency,
        message: 'OpenAI Sora API is available',
      };
    } catch (error) {
      return {
        available: false,
        message: `[Sora] Health check error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  async generate(params: VideoGenerateParams): Promise<VideoJobResult> {
    if (!this.isConfigured()) {
      throw new Error('[Sora] API key not configured');
    }

    const model = this.getModel(params.model);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const body = this.buildRequestBody(params, model);

      const response = await fetch(`${SORA_API_BASE}/videos/generations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.getApiKey()}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`[Sora] Generation failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const estimate = this.estimateCost(params);

      return {
        jobId: data.id || data.job_id,
        providerId: 'sora',
        model: params.model,
        status: 'pending',
        estimatedCost: estimate.amount,
        estimatedDuration: this.estimateProcessingTime(params.duration),
      };
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('[Sora] Request timed out');
      }
      throw error;
    }
  }

  async checkStatus(jobId: string): Promise<VideoStatusResult> {
    if (!this.isConfigured()) {
      throw new Error('[Sora] API key not configured');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(`${SORA_API_BASE}/videos/generations/${jobId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.getApiKey()}`,
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`[Sora] Status check failed: ${response.status}`);
      }

      const data = await response.json();

      return {
        status: this.mapStatus(data.status),
        progress: data.progress,
        videoUrl: data.video_url || data.output?.video,
        thumbnailUrl: data.thumbnail_url || data.output?.thumbnail,
        error: data.error,
        actualCost: data.cost,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async cancel(jobId: string): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error('[Sora] API key not configured');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(`${SORA_API_BASE}/videos/generations/${jobId}/cancel`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.getApiKey()}`,
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(`[Sora] Cancel failed for job ${jobId}: ${response.status}`);
        throw new Error(`[Sora] Failed to cancel job: ${response.status}`);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error(`[Sora] Cancel error for job ${jobId}:`, error);
      throw error;
    }
  }

  private buildRequestBody(
    params: VideoGenerateParams,
    model: VideoModelConfig
  ): Record<string, unknown> {
    const normalizedDuration = normalizeDuration(params.duration);

    const body: Record<string, unknown> = {
      model: model.name,
      prompt: params.prompt,
      duration: normalizedDuration,
      aspect_ratio: params.aspectRatio,
    };

    if (params.negativePrompt) {
      body.negative_prompt = params.negativePrompt;
    }

    if (params.startImage && model.supportsImageToVideo) {
      body.image = params.startImage;
    }

    if (params.seed !== undefined) {
      body.seed = params.seed;
    }

    if (params.resolution) {
      body.resolution = params.resolution;
    }

    return body;
  }

  private mapStatus(
    soraStatus: string
  ): 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled' {
    const statusMap: Record<string, VideoStatusResult['status']> = {
      queued: 'pending',
      pending: 'pending',
      processing: 'processing',
      running: 'processing',
      in_progress: 'processing',
      completed: 'succeeded',
      succeeded: 'succeeded',
      success: 'succeeded',
      failed: 'failed',
      error: 'failed',
      cancelled: 'cancelled',
      canceled: 'cancelled',
    };

    return statusMap[soraStatus.toLowerCase()] || 'processing';
  }

  private estimateProcessingTime(duration: number): number {
    // Sora typically takes longer due to quality - estimate ~60s per second of video
    const normalizedDuration = normalizeDuration(duration);
    return Math.max(60, normalizedDuration * 60);
  }
}

export const soraProvider = new SoraProvider();
