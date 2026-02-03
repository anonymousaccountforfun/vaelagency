// dashboard/lib/video/providers/replicate.ts

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

const REPLICATE_API_BASE = 'https://api.replicate.com/v1';
const FETCH_TIMEOUT_MS = 30000; // 30 seconds

/**
 * Fetch with timeout using AbortController
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = FETCH_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeout}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Model configurations for Replicate-hosted models
const REPLICATE_MODELS: VideoModelConfig[] = [
  {
    id: 'minimax-video',
    providerId: 'replicate',
    name: 'minimax/video-01',
    displayName: 'Minimax Video-01',
    description: 'High quality video generation with good motion',
    costPerSecond: 0.05,
    defaultDuration: 5,
    maxDuration: 6,
    supportsImageToVideo: true,
    supportsCharacterRef: false,
    supportsKeyframes: false,
    aspectRatios: ['16:9', '9:16', '1:1'],
    qualityTier: 'standard',
    bestFor: ['fast iteration', 'social content'],
  },
  {
    id: 'luma-ray-replicate',
    providerId: 'replicate',
    name: 'luma/ray',
    displayName: 'Luma Ray (Replicate)',
    description: 'Natural motion, great for product animations',
    costPerSecond: 0.05,
    defaultDuration: 5,
    maxDuration: 5,
    supportsImageToVideo: true,
    supportsCharacterRef: false,
    supportsKeyframes: false,
    aspectRatios: ['16:9', '9:16', '1:1'],
    qualityTier: 'standard',
    bestFor: ['product shots', 'natural motion'],
  },
  {
    id: 'kling-replicate',
    providerId: 'replicate',
    name: 'kwaivgi/kling-v2.6',
    displayName: 'Kling v2.6 (Replicate)',
    description: 'Top-tier cinematic visuals with fluid motion',
    costPerSecond: 0.06,
    defaultDuration: 5,
    maxDuration: 10,
    supportsImageToVideo: true,
    supportsCharacterRef: false,
    supportsKeyframes: false,
    aspectRatios: ['16:9', '9:16', '1:1'],
    qualityTier: 'premium',
    bestFor: ['hero content', 'cinematic quality'],
  },
  {
    id: 'ltx-video',
    providerId: 'replicate',
    name: 'lightricks/ltx-video',
    displayName: 'LTX Video',
    description: 'Real-time video generation, fast and efficient',
    costPerSecond: 0.02,
    defaultDuration: 5,
    maxDuration: 10,
    supportsImageToVideo: true,
    supportsCharacterRef: false,
    supportsKeyframes: false,
    aspectRatios: ['16:9', '9:16', '1:1'],
    qualityTier: 'budget',
    bestFor: ['quick drafts', 'budget-conscious'],
  },
];

export class ReplicateProvider implements VideoProvider {
  id: VideoProviderId = 'replicate';
  name = 'Replicate';
  models = REPLICATE_MODELS;
  capabilities: ProviderCapabilities = {
    textToVideo: true,
    imageToVideo: true,
    videoToVideo: false,
    characterReference: false,
    keyframes: false,
    lipSync: false,
  };

  private getApiToken(): string | undefined {
    return process.env.REPLICATE_API_TOKEN;
  }

  isConfigured(): boolean {
    return !!this.getApiToken();
  }

  async healthCheck(): Promise<ProviderHealthStatus> {
    if (!this.isConfigured()) {
      return { available: false, message: 'API token not configured' };
    }

    try {
      const start = Date.now();
      const response = await fetchWithTimeout(`${REPLICATE_API_BASE}/models`, {
        headers: { Authorization: `Bearer ${this.getApiToken()}` },
      });
      const latency = Date.now() - start;

      if (response.ok) {
        return { available: true, latency };
      }
      return { available: false, message: `API returned ${response.status}` };
    } catch (error) {
      const errorMessage = error instanceof Error
        ? `${error.message} (${error.name})`
        : String(error);
      console.error('[Replicate] Health check failed:', errorMessage);
      return { available: false, message: errorMessage };
    }
  }

  estimateCost(params: VideoGenerateParams): VideoCostEstimate {
    const model = this.models.find(m => m.id === params.model);
    if (!model) {
      throw new Error(`Unknown model: ${params.model}`);
    }

    const duration = Math.min(params.duration, model.maxDuration);
    const baseCost = model.costPerSecond * duration;

    return {
      amount: baseCost,
      currency: 'USD',
      breakdown: {
        baseCost: model.costPerSecond,
        durationMultiplier: duration,
        qualityMultiplier: 1,
      },
    };
  }

  async generate(params: VideoGenerateParams): Promise<VideoJobResult> {
    if (!this.isConfigured()) {
      throw new Error('Replicate API token not configured');
    }

    const model = this.models.find(m => m.id === params.model);
    if (!model) {
      throw new Error(`Unknown model: ${params.model}`);
    }

    const input = this.buildInput(params, model);
    const duration = Math.min(params.duration, model.maxDuration);

    const response = await fetchWithTimeout(
      `${REPLICATE_API_BASE}/models/${model.name}/predictions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.getApiToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input }),
      }
    );

    if (!response.ok) {
      throw new Error(`Replicate API error: ${response.status}`);
    }

    const prediction = await response.json();

    return {
      jobId: prediction.id,
      providerId: this.id,
      model: params.model,
      status: 'pending',
      estimatedCost: this.estimateCost(params).amount,
      estimatedDuration: this.estimateTime(params.model, duration),
    };
  }

  async checkStatus(jobId: string): Promise<VideoStatusResult> {
    if (!this.isConfigured()) {
      throw new Error('Replicate API token not configured');
    }

    const response = await fetchWithTimeout(`${REPLICATE_API_BASE}/predictions/${jobId}`, {
      headers: { Authorization: `Bearer ${this.getApiToken()}` },
    });

    if (!response.ok) {
      throw new Error(`Failed to check status: ${response.status}`);
    }

    const prediction = await response.json();

    const statusMap: Record<string, VideoStatusResult['status']> = {
      starting: 'processing',
      processing: 'processing',
      succeeded: 'succeeded',
      failed: 'failed',
      canceled: 'cancelled',
    };

    const status = statusMap[prediction.status] || 'processing';
    const videoUrl = prediction.output
      ? Array.isArray(prediction.output)
        ? prediction.output[0]
        : prediction.output
      : undefined;

    return {
      status,
      videoUrl,
      error: prediction.error || undefined,
      progress: this.parseProgress(prediction.logs),
    };
  }

  async cancel(jobId: string): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error('Replicate API token not configured');
    }

    await fetchWithTimeout(`${REPLICATE_API_BASE}/predictions/${jobId}/cancel`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.getApiToken()}` },
    });
  }

  private buildInput(
    params: VideoGenerateParams,
    model: VideoModelConfig
  ): Record<string, unknown> {
    const input: Record<string, unknown> = {
      prompt: params.prompt,
    };

    // Model-specific input formatting
    if (model.id === 'minimax-video') {
      input.prompt_optimizer = true;
      if (params.aspectRatio !== '16:9') {
        input.aspect_ratio = params.aspectRatio;
      }
      if (params.startImage) {
        input.first_frame_image = params.startImage;
      }
    } else if (model.id === 'luma-ray-replicate') {
      input.aspect_ratio = params.aspectRatio;
      if (params.negativePrompt) {
        input.negative_prompt = params.negativePrompt;
      }
      if (params.startImage) {
        input.start_image = params.startImage;
      }
    } else if (model.id === 'kling-replicate') {
      input.aspect_ratio = params.aspectRatio;
      input.duration = Math.min(params.duration, model.maxDuration);
      if (params.negativePrompt) {
        input.negative_prompt = params.negativePrompt;
      }
      if (params.startImage) {
        input.image = params.startImage;
      }
    } else if (model.id === 'ltx-video') {
      input.aspect_ratio = params.aspectRatio;
      if (params.negativePrompt) {
        input.negative_prompt = params.negativePrompt;
      }
      if (params.startImage) {
        input.image = params.startImage;
      }
    }

    if (params.seed !== undefined) {
      input.seed = params.seed;
    }

    return input;
  }

  private estimateTime(modelId: string, duration: number): number {
    const baseEstimates: Record<string, number> = {
      'minimax-video': 30,
      'luma-ray-replicate': 45,
      'kling-replicate': 60,
      'ltx-video': 20,
    };
    const base = baseEstimates[modelId] || 45;
    return Math.round(base * (duration / 5));
  }

  private parseProgress(logs?: string): number | undefined {
    if (!logs) return undefined;
    // Try to parse percentage from logs
    const match = logs.match(/(\d+)%/);
    return match ? parseInt(match[1], 10) : undefined;
  }
}

// Export singleton instance
export const replicateProvider = new ReplicateProvider();
