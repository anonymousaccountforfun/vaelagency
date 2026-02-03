// dashboard/lib/video/providers/runway.ts

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

const RUNWAY_API_BASE = 'https://api.runwayml.com/v1';
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

// Runway Gen-3 Alpha models
const RUNWAY_MODELS: VideoModelConfig[] = [
  {
    id: 'runway-gen3-alpha',
    providerId: 'runway',
    name: 'gen3a_turbo',
    displayName: 'Runway Gen-3 Alpha Turbo',
    description: 'Fast, high-quality video generation with motion control',
    costPerSecond: 0.05,
    defaultDuration: 5,
    maxDuration: 10,
    supportsImageToVideo: true,
    supportsCharacterRef: false,
    supportsKeyframes: true,
    aspectRatios: ['16:9', '9:16', '1:1'],
    qualityTier: 'premium',
    bestFor: ['motion control', 'cinematic', 'commercial content'],
  },
];

export class RunwayProvider implements VideoProvider {
  id: VideoProviderId = 'runway';
  name = 'Runway';
  models = RUNWAY_MODELS;
  capabilities: ProviderCapabilities = {
    textToVideo: true,
    imageToVideo: true,
    videoToVideo: false,
    characterReference: false,
    keyframes: true,
    lipSync: false,
  };

  private getApiKey(): string | undefined {
    return process.env.RUNWAY_API_KEY;
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
      // Runway uses /tasks endpoint for listing tasks
      const response = await fetchWithTimeout(`${RUNWAY_API_BASE}/tasks`, {
        headers: { Authorization: `Bearer ${this.getApiKey()}` },
      });
      const latency = Date.now() - start;

      if (response.ok) {
        return { available: true, latency };
      }
      return { available: false, message: `API returned ${response.status}` };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? `${error.message} (${error.name})`
          : String(error);
      console.error('[Runway] Health check failed:', errorMessage);
      return { available: false, message: errorMessage };
    }
  }

  estimateCost(params: VideoGenerateParams): VideoCostEstimate {
    const model = this.models.find((m) => m.id === params.model);
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
      throw new Error('Runway API key not configured');
    }

    const model = this.models.find((m) => m.id === params.model);
    if (!model) {
      throw new Error(`Unknown model: ${params.model}`);
    }

    const body = this.buildRequestBody(params, model);

    const response = await fetchWithTimeout(`${RUNWAY_API_BASE}/image_to_video`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.getApiKey()}`,
        'Content-Type': 'application/json',
        'X-Runway-Version': '2024-11-06',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Runway API error: ${response.status}`);
    }

    const task = await response.json();
    const duration = Math.min(params.duration, model.maxDuration);

    return {
      jobId: task.id,
      providerId: this.id,
      model: params.model,
      status: 'pending',
      estimatedCost: this.estimateCost(params).amount,
      estimatedDuration: this.estimateTime(duration),
    };
  }

  async checkStatus(jobId: string): Promise<VideoStatusResult> {
    if (!this.isConfigured()) {
      throw new Error('Runway API key not configured');
    }

    const response = await fetchWithTimeout(`${RUNWAY_API_BASE}/tasks/${jobId}`, {
      headers: {
        Authorization: `Bearer ${this.getApiKey()}`,
        'X-Runway-Version': '2024-11-06',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to check status: ${response.status}`);
    }

    const task = await response.json();

    const statusMap: Record<string, VideoStatusResult['status']> = {
      PENDING: 'pending',
      RUNNING: 'processing',
      SUCCEEDED: 'succeeded',
      FAILED: 'failed',
      CANCELLED: 'cancelled',
    };

    return {
      status: statusMap[task.status] || 'processing',
      progress: task.progress,
      videoUrl: task.output?.[0],
      error: task.failure,
    };
  }

  async cancel(jobId: string): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error('Runway API key not configured');
    }

    const response = await fetchWithTimeout(`${RUNWAY_API_BASE}/tasks/${jobId}/cancel`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.getApiKey()}`,
        'X-Runway-Version': '2024-11-06',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to cancel task: ${response.status}`);
    }
  }

  private buildRequestBody(
    params: VideoGenerateParams,
    model: VideoModelConfig
  ): Record<string, unknown> {
    const body: Record<string, unknown> = {
      model: model.name,
      promptText: params.prompt,
      ratio: params.aspectRatio,
      duration: Math.min(params.duration, model.maxDuration),
    };

    // Image-to-video: Runway requires promptImage
    if (params.startImage) {
      body.promptImage = params.startImage;
    }

    // Keyframe support for end image
    if (params.endImage) {
      body.lastFrame = { type: 'image', url: params.endImage };
    }

    // Seed for reproducibility
    if (params.seed !== undefined) {
      body.seed = params.seed;
    }

    return body;
  }

  private estimateTime(duration: number): number {
    // Runway Gen-3 Turbo typically takes ~30 seconds per 5 seconds of video
    return Math.round(30 * (duration / 5));
  }
}

// Export singleton instance
export const runwayProvider = new RunwayProvider();
