// dashboard/lib/video/providers/kling.ts

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

// Note: Kling API base URL - this may need adjustment based on actual API docs
const KLING_API_BASE = 'https://api.klingai.com/v1';
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

// Kling direct API models
const KLING_MODELS: VideoModelConfig[] = [
  {
    id: 'kling-v2.5',
    providerId: 'kling',
    name: 'kling-v2.5',
    displayName: 'Kling v2.5',
    description: 'High quality with 40% faster generation',
    costPerSecond: 0.05,
    defaultDuration: 5,
    maxDuration: 10,
    supportsImageToVideo: true,
    supportsCharacterRef: true,
    supportsKeyframes: false,
    aspectRatios: ['16:9', '9:16', '1:1'],
    qualityTier: 'premium',
    bestFor: ['fast premium', 'human subjects'],
  },
  {
    id: 'kling-v2.6',
    providerId: 'kling',
    name: 'kling-v2.6',
    displayName: 'Kling v2.6',
    description: 'Top-tier cinematic visuals with fluid motion',
    costPerSecond: 0.06,
    defaultDuration: 5,
    maxDuration: 10,
    supportsImageToVideo: true,
    supportsCharacterRef: true,
    supportsKeyframes: false,
    aspectRatios: ['16:9', '9:16', '1:1'],
    qualityTier: 'premium',
    bestFor: ['hero content', 'highest quality'],
  },
  {
    id: 'kling-o1',
    providerId: 'kling',
    name: 'kling-o1',
    displayName: 'Kling O1',
    description: 'Unified multimodal model with Elements support',
    costPerSecond: 0.07,
    defaultDuration: 5,
    maxDuration: 10,
    supportsImageToVideo: true,
    supportsCharacterRef: true,
    supportsKeyframes: false,
    aspectRatios: ['16:9', '9:16', '1:1'],
    qualityTier: 'premium',
    bestFor: ['multi-element', 'character consistency', 'complex scenes'],
  },
];

export class KlingProvider implements VideoProvider {
  id: VideoProviderId = 'kling';
  name = 'Kling AI';
  models = KLING_MODELS;
  capabilities: ProviderCapabilities = {
    textToVideo: true,
    imageToVideo: true,
    videoToVideo: false,
    characterReference: true, // Elements feature
    keyframes: false,
    lipSync: true,
  };

  private getApiKey(): string | undefined {
    return process.env.KLING_API_KEY;
  }

  isConfigured(): boolean {
    return !!this.getApiKey();
  }

  async healthCheck(): Promise<ProviderHealthStatus> {
    if (!this.isConfigured()) {
      return { available: false, message: 'API key not configured' };
    }

    // Kling health check - adjust endpoint as needed
    try {
      const start = Date.now();
      const response = await fetchWithTimeout(`${KLING_API_BASE}/health`, {
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
      console.error('[Kling] Health check failed:', errorMessage);
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

    // Elements (character ref) may cost more
    const qualityMultiplier = params.referenceImages?.length ? 1.2 : 1;

    return {
      amount: baseCost * qualityMultiplier,
      currency: 'USD',
      breakdown: {
        baseCost: model.costPerSecond,
        durationMultiplier: duration,
        qualityMultiplier,
      },
    };
  }

  async generate(params: VideoGenerateParams): Promise<VideoJobResult> {
    if (!this.isConfigured()) {
      throw new Error('Kling API key not configured');
    }

    const model = this.models.find(m => m.id === params.model);
    if (!model) {
      throw new Error(`Unknown model: ${params.model}`);
    }

    // Use Elements API if reference images provided
    const endpoint = params.referenceImages?.length
      ? `${KLING_API_BASE}/videos/elements`
      : `${KLING_API_BASE}/videos`;

    const body = this.buildRequestBody(params, model);

    const response = await fetchWithTimeout(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.getApiKey()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Kling API error: ${response.status}`);
    }

    const result = await response.json();
    const duration = Math.min(params.duration, model.maxDuration);

    return {
      jobId: result.task_id,
      providerId: this.id,
      model: params.model,
      status: 'pending',
      estimatedCost: this.estimateCost(params).amount,
      estimatedDuration: this.estimateTime(duration),
    };
  }

  async checkStatus(jobId: string): Promise<VideoStatusResult> {
    if (!this.isConfigured()) {
      throw new Error('Kling API key not configured');
    }

    const response = await fetchWithTimeout(`${KLING_API_BASE}/videos/${jobId}`, {
      headers: { Authorization: `Bearer ${this.getApiKey()}` },
    });

    if (!response.ok) {
      throw new Error(`Failed to check status: ${response.status}`);
    }

    const result = await response.json();

    const statusMap: Record<string, VideoStatusResult['status']> = {
      pending: 'pending',
      processing: 'processing',
      completed: 'succeeded',
      success: 'succeeded',
      failed: 'failed',
      error: 'failed',
    };

    return {
      status: statusMap[result.status] || 'processing',
      videoUrl: result.video_url,
      thumbnailUrl: result.thumbnail_url,
      error: result.error_message,
      progress: result.progress,
    };
  }

  async cancel(jobId: string): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error('Kling API key not configured');
    }

    await fetchWithTimeout(`${KLING_API_BASE}/videos/${jobId}/cancel`, {
      method: 'POST',
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
      duration: Math.min(params.duration, model.maxDuration),
    };

    if (params.negativePrompt) {
      body.negative_prompt = params.negativePrompt;
    }

    if (params.startImage) {
      body.image = params.startImage;
    }

    if (params.seed !== undefined) {
      body.seed = params.seed;
    }

    // Elements (character reference) - Kling supports up to 4
    if (params.referenceImages && params.referenceImages.length > 0) {
      body.elements = params.referenceImages.slice(0, 4).map((url, i) => ({
        type: i === 0 ? 'character' : 'object',
        image_url: url,
      }));
    }

    return body;
  }

  private estimateTime(duration: number): number {
    // Kling typically takes ~60s for 5s video
    return Math.round(60 * (duration / 5));
  }
}

// Export singleton instance
export const klingProvider = new KlingProvider();
