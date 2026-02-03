// dashboard/lib/video/providers/pika.ts

/**
 * Pika Labs Video Generation Provider
 *
 * Known for fast iteration, creative effects (crush, melt, explode, inflate),
 * and cost-effective video generation.
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

/**
 * Pika Labs model configurations
 */
export const PIKA_MODELS: VideoModelConfig[] = [
  {
    id: 'pika-1.5',
    providerId: 'pika',
    name: 'pika-1.5',
    displayName: 'Pika 1.5',
    description: 'Latest Pika model with improved quality and creative effects',
    costPerSecond: 0.02,
    defaultDuration: 4,
    maxDuration: 10,
    supportsImageToVideo: true,
    supportsCharacterRef: false,
    supportsKeyframes: false,
    aspectRatios: ['16:9', '9:16', '1:1'] as const,
    qualityTier: 'standard',
    bestFor: ['quick iterations', 'creative effects', 'social content'],
  },
  {
    id: 'pika-1.0',
    providerId: 'pika',
    name: 'pika-1.0',
    displayName: 'Pika 1.0',
    description: 'Original Pika model, fast and cost-effective',
    costPerSecond: 0.015,
    defaultDuration: 3,
    maxDuration: 8,
    supportsImageToVideo: true,
    supportsCharacterRef: false,
    supportsKeyframes: false,
    aspectRatios: ['16:9', '9:16', '1:1'] as const,
    qualityTier: 'budget',
    bestFor: ['rapid prototyping', 'drafts', 'previews'],
  },
];

const PIKA_API_BASE = 'https://api.pika.art/v1';

export class PikaProvider implements VideoProvider {
  id: VideoProviderId = 'pika';
  name = 'Pika AI';
  models = PIKA_MODELS;

  capabilities: ProviderCapabilities = {
    textToVideo: true,
    imageToVideo: true,
    videoToVideo: false,
    characterReference: false,
    keyframes: false,
    lipSync: false,
  };

  private getApiKey(): string | undefined {
    return process.env.PIKA_API_KEY;
  }

  isConfigured(): boolean {
    const key = this.getApiKey();
    return !!key && key.length > 0;
  }

  private getModel(modelId: string): VideoModelConfig {
    const model = this.models.find((m) => m.id === modelId);
    if (!model) {
      throw new Error(`[Pika] Unknown model: ${modelId}`);
    }
    return model;
  }

  estimateCost(params: VideoGenerateParams): VideoCostEstimate {
    const model = this.getModel(params.model);
    const duration = Math.min(params.duration, model.maxDuration);
    const baseCost = model.costPerSecond * duration;

    // Quality multiplier based on tier
    const qualityMultiplier = model.qualityTier === 'premium' ? 1.5 : 1.0;

    return {
      amount: baseCost * qualityMultiplier,
      currency: 'USD',
      breakdown: {
        baseCost,
        durationMultiplier: duration / model.defaultDuration,
        qualityMultiplier,
      },
    };
  }

  async healthCheck(): Promise<ProviderHealthStatus> {
    if (!this.isConfigured()) {
      return {
        available: false,
        message: '[Pika] API key not configured',
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const startTime = Date.now();
      const response = await fetch(`${PIKA_API_BASE}/health`, {
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
          message: `[Pika] Health check failed: ${response.status}`,
        };
      }

      return {
        available: true,
        latency,
        message: 'Pika API is available',
      };
    } catch (error) {
      return {
        available: false,
        message: `[Pika] Health check error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  async generate(params: VideoGenerateParams): Promise<VideoJobResult> {
    if (!this.isConfigured()) {
      throw new Error('[Pika] API key not configured');
    }

    const model = this.getModel(params.model);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const body = this.buildRequestBody(params, model);

      const response = await fetch(`${PIKA_API_BASE}/generate`, {
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
        throw new Error(`[Pika] Generation failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const estimate = this.estimateCost(params);

      return {
        jobId: data.id || data.job_id,
        providerId: 'pika',
        model: params.model,
        status: 'pending',
        estimatedCost: estimate.amount,
        estimatedDuration: this.estimateProcessingTime(params.duration),
      };
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('[Pika] Request timed out');
      }
      throw error;
    }
  }

  async checkStatus(jobId: string): Promise<VideoStatusResult> {
    if (!this.isConfigured()) {
      throw new Error('[Pika] API key not configured');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(`${PIKA_API_BASE}/jobs/${jobId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.getApiKey()}`,
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`[Pika] Status check failed: ${response.status}`);
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
      throw new Error('[Pika] API key not configured');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(`${PIKA_API_BASE}/jobs/${jobId}/cancel`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.getApiKey()}`,
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(`[Pika] Cancel failed for job ${jobId}: ${response.status}`);
        throw new Error(`[Pika] Failed to cancel job: ${response.status}`);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error(`[Pika] Cancel error for job ${jobId}:`, error);
      throw error;
    }
  }

  private buildRequestBody(
    params: VideoGenerateParams,
    model: VideoModelConfig
  ): Record<string, unknown> {
    const body: Record<string, unknown> = {
      model: model.name,
      prompt: params.prompt,
      duration: Math.min(params.duration, model.maxDuration),
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

    return body;
  }

  private mapStatus(
    pikaStatus: string
  ): 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled' {
    const statusMap: Record<string, VideoStatusResult['status']> = {
      queued: 'pending',
      pending: 'pending',
      processing: 'processing',
      running: 'processing',
      completed: 'succeeded',
      succeeded: 'succeeded',
      success: 'succeeded',
      failed: 'failed',
      error: 'failed',
      cancelled: 'cancelled',
      canceled: 'cancelled',
    };

    return statusMap[pikaStatus.toLowerCase()] || 'processing';
  }

  private estimateProcessingTime(duration: number): number {
    // Pika is known for fast generation, estimate ~30s per second of video
    return Math.max(30, duration * 30);
  }
}

export const pikaProvider = new PikaProvider();
