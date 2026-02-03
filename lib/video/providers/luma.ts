// dashboard/lib/video/providers/luma.ts

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

const LUMA_API_BASE = 'https://api.lumalabs.ai/dream-machine/v1';
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

// Luma direct API models
const LUMA_MODELS: VideoModelConfig[] = [
  {
    id: 'luma-ray3',
    providerId: 'luma',
    name: 'ray3',
    displayName: 'Luma Ray3',
    description: 'Reasoning-driven generation with excellent quality',
    costPerSecond: 0.05,
    defaultDuration: 5,
    maxDuration: 9,
    supportsImageToVideo: true,
    supportsCharacterRef: true,
    supportsKeyframes: true,
    aspectRatios: ['16:9', '9:16', '1:1', '4:3', '3:4', '21:9', '9:21'],
    qualityTier: 'premium',
    bestFor: ['cinematic', 'character consistency', 'keyframe control'],
  },
  {
    id: 'luma-ray3.14',
    providerId: 'luma',
    name: 'ray3.14',
    displayName: 'Luma Ray3.14',
    description: 'Native 1080p, 4x faster, best quality',
    costPerSecond: 0.04,
    defaultDuration: 5,
    maxDuration: 9,
    supportsImageToVideo: true,
    supportsCharacterRef: true,
    supportsKeyframes: true,
    aspectRatios: ['16:9', '9:16', '1:1', '4:3', '3:4', '21:9', '9:21'],
    qualityTier: 'premium',
    bestFor: ['fast high-quality', 'native 1080p'],
  },
];

export class LumaProvider implements VideoProvider {
  id: VideoProviderId = 'luma';
  name = 'Luma AI';
  models = LUMA_MODELS;
  capabilities: ProviderCapabilities = {
    textToVideo: true,
    imageToVideo: true,
    videoToVideo: true,
    characterReference: true,
    keyframes: true,
    lipSync: false,
  };

  private getApiKey(): string | undefined {
    return process.env.LUMA_API_KEY;
  }

  isConfigured(): boolean {
    return !!this.getApiKey();
  }

  async healthCheck(): Promise<ProviderHealthStatus> {
    if (!this.isConfigured()) {
      return { available: false, message: 'API key not configured' };
    }

    try {
      const start = Date.now();
      // Luma doesn't have a dedicated health endpoint, use generations list
      const response = await fetchWithTimeout(`${LUMA_API_BASE}/generations?limit=1`, {
        headers: { Authorization: `Bearer ${this.getApiKey()}` },
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
      console.error('[Luma] Health check failed:', errorMessage);
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
      throw new Error('Luma API key not configured');
    }

    const model = this.models.find(m => m.id === params.model);
    if (!model) {
      throw new Error(`Unknown model: ${params.model}`);
    }

    const body = this.buildRequestBody(params, model);

    const response = await fetchWithTimeout(`${LUMA_API_BASE}/generations`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.getApiKey()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Luma API error: ${response.status}`);
    }

    const generation = await response.json();
    const duration = Math.min(params.duration, model.maxDuration);

    return {
      jobId: generation.id,
      providerId: this.id,
      model: params.model,
      status: 'pending',
      estimatedCost: this.estimateCost(params).amount,
      estimatedDuration: this.estimateTime(duration),
    };
  }

  async checkStatus(jobId: string): Promise<VideoStatusResult> {
    if (!this.isConfigured()) {
      throw new Error('Luma API key not configured');
    }

    const response = await fetchWithTimeout(`${LUMA_API_BASE}/generations/${jobId}`, {
      headers: { Authorization: `Bearer ${this.getApiKey()}` },
    });

    if (!response.ok) {
      throw new Error(`Failed to check status: ${response.status}`);
    }

    const generation = await response.json();

    const statusMap: Record<string, VideoStatusResult['status']> = {
      queued: 'pending',
      dreaming: 'processing',
      completed: 'succeeded',
      failed: 'failed',
    };

    return {
      status: statusMap[generation.state] || 'processing',
      videoUrl: generation.assets?.video,
      thumbnailUrl: generation.assets?.thumbnail,
      error: generation.failure_reason,
    };
  }

  async cancel(jobId: string): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error('Luma API key not configured');
    }

    await fetchWithTimeout(`${LUMA_API_BASE}/generations/${jobId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${this.getApiKey()}` },
    });
  }

  private buildRequestBody(
    params: VideoGenerateParams,
    model: VideoModelConfig
  ): Record<string, unknown> {
    const body: Record<string, unknown> = {
      prompt: params.prompt,
      model: model.name,
      aspect_ratio: params.aspectRatio,
    };

    // Keyframes for image-to-video
    if (params.startImage || params.endImage) {
      const keyframes: Record<string, unknown> = {};
      if (params.startImage) {
        keyframes.frame0 = { type: 'image', url: params.startImage };
      }
      if (params.endImage) {
        keyframes.frame1 = { type: 'image', url: params.endImage };
      }
      body.keyframes = keyframes;
    }

    // Character reference
    if (params.referenceImages && params.referenceImages.length > 0) {
      body.character_ref = {
        identity0: { images: params.referenceImages },
      };
    }

    return body;
  }

  private estimateTime(duration: number): number {
    // Luma Ray3.14 is ~4x faster
    return Math.round(30 * (duration / 5));
  }
}

// Export singleton instance
export const lumaProvider = new LumaProvider();
