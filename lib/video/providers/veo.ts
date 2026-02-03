// dashboard/lib/video/providers/veo.ts

/**
 * Google Veo Video Generation Provider
 *
 * Veo 3 is Google's state-of-the-art video generation model accessed via
 * the Gemini API. Known for high-quality output and lip sync capabilities.
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
 * Google Veo model configurations
 */
export const VEO_MODELS: VideoModelConfig[] = [
  {
    id: 'veo-3',
    providerId: 'veo',
    name: 'veo-3.0-generate-preview',
    displayName: 'Veo 3',
    description: 'Standard Veo 3 model with balanced quality and cost',
    costPerSecond: 0.08,
    defaultDuration: 5,
    maxDuration: 8,
    supportsImageToVideo: true,
    supportsCharacterRef: false,
    supportsKeyframes: false,
    aspectRatios: ['16:9', '9:16', '1:1'] as const,
    qualityTier: 'standard',
    bestFor: ['general video generation', 'marketing content', 'social media'],
  },
  {
    id: 'veo-3.1',
    providerId: 'veo',
    name: 'veo-3.1-generate-preview',
    displayName: 'Veo 3.1',
    description: 'Premium Veo model with highest quality and lip sync',
    costPerSecond: 0.15,
    defaultDuration: 5,
    maxDuration: 8,
    supportsImageToVideo: true,
    supportsCharacterRef: false,
    supportsKeyframes: false,
    aspectRatios: ['16:9', '9:16', '1:1'] as const,
    qualityTier: 'premium',
    bestFor: ['high-quality production', 'lip sync', 'professional content'],
  },
  {
    id: 'veo-3.1-fast',
    providerId: 'veo',
    name: 'veo-3.1-fast-generate-preview',
    displayName: 'Veo 3.1 Fast',
    description: 'Budget-friendly fast generation for quick iterations',
    costPerSecond: 0.06,
    defaultDuration: 4,
    maxDuration: 8,
    supportsImageToVideo: true,
    supportsCharacterRef: false,
    supportsKeyframes: false,
    aspectRatios: ['16:9', '9:16', '1:1'] as const,
    qualityTier: 'budget',
    bestFor: ['rapid prototyping', 'drafts', 'previews'],
  },
];

const VEO_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

export class VeoProvider implements VideoProvider {
  id: VideoProviderId = 'veo';
  name = 'Google Veo';
  models = VEO_MODELS;

  capabilities: ProviderCapabilities = {
    textToVideo: true,
    imageToVideo: true,
    videoToVideo: false,
    characterReference: false,
    keyframes: false,
    lipSync: true,
  };

  private getApiKey(): string | undefined {
    return process.env.GOOGLE_AI_API_KEY;
  }

  isConfigured(): boolean {
    const key = this.getApiKey();
    return !!key && key.length > 0;
  }

  private getModel(modelId: string): VideoModelConfig {
    const model = this.models.find((m) => m.id === modelId);
    if (!model) {
      throw new Error(`[Veo] Unknown model: ${modelId}`);
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
        message: '[Veo] API key not configured',
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const startTime = Date.now();
      // Use models endpoint for health check
      const response = await fetch(
        `${VEO_API_BASE}/models?key=${this.getApiKey()}`,
        {
          method: 'GET',
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);

      const latency = Date.now() - startTime;

      if (!response.ok) {
        return {
          available: false,
          latency,
          message: `[Veo] Health check failed: ${response.status}`,
        };
      }

      return {
        available: true,
        latency,
        message: 'Google Veo API is available',
      };
    } catch (error) {
      return {
        available: false,
        message: `[Veo] Health check error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  async generate(params: VideoGenerateParams): Promise<VideoJobResult> {
    if (!this.isConfigured()) {
      throw new Error('[Veo] API key not configured');
    }

    const model = this.getModel(params.model);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const body = this.buildRequestBody(params, model);

      const response = await fetch(
        `${VEO_API_BASE}/models/${model.name}:generateVideo?key=${this.getApiKey()}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`[Veo] Generation failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const estimate = this.estimateCost(params);

      return {
        jobId: data.name || data.operation_id,
        providerId: 'veo',
        model: params.model,
        status: 'pending',
        estimatedCost: estimate.amount,
        estimatedDuration: this.estimateProcessingTime(params.duration),
      };
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('[Veo] Request timed out');
      }
      throw error;
    }
  }

  async checkStatus(jobId: string): Promise<VideoStatusResult> {
    if (!this.isConfigured()) {
      throw new Error('[Veo] API key not configured');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(
        `${VEO_API_BASE}/${jobId}?key=${this.getApiKey()}`,
        {
          method: 'GET',
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`[Veo] Status check failed: ${response.status}`);
      }

      const data = await response.json();

      return {
        status: this.mapStatus(data),
        progress: data.metadata?.progress,
        videoUrl: data.response?.generatedVideos?.[0]?.uri,
        thumbnailUrl: data.response?.generatedVideos?.[0]?.thumbnailUri,
        error: data.error?.message,
        actualCost: data.metadata?.cost,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async cancel(jobId: string): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error('[Veo] API key not configured');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(
        `${VEO_API_BASE}/${jobId}:cancel?key=${this.getApiKey()}`,
        {
          method: 'POST',
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(`[Veo] Cancel failed for job ${jobId}: ${response.status}`);
        throw new Error(`[Veo] Failed to cancel job: ${response.status}`);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error(`[Veo] Cancel error for job ${jobId}:`, error);
      throw error;
    }
  }

  private buildRequestBody(
    params: VideoGenerateParams,
    model: VideoModelConfig
  ): Record<string, unknown> {
    const body: Record<string, unknown> = {
      prompt: params.prompt,
      config: {
        numberOfVideos: 1,
        durationSeconds: Math.min(params.duration, model.maxDuration),
        aspectRatio: params.aspectRatio,
      },
    };

    if (params.negativePrompt) {
      body.negativePrompt = params.negativePrompt;
    }

    if (params.startImage && model.supportsImageToVideo) {
      body.image = {
        imageUri: params.startImage,
      };
    }

    if (params.seed !== undefined) {
      (body.config as Record<string, unknown>).seed = params.seed;
    }

    return body;
  }

  private mapStatus(
    data: Record<string, unknown>
  ): 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled' {
    // Check if operation is done
    if (data.done === true) {
      // Check for error
      if (data.error) {
        return 'failed';
      }
      // Check for response
      if (data.response) {
        return 'succeeded';
      }
    }

    // Check metadata state
    const state = (data.metadata as Record<string, unknown>)?.state;
    if (typeof state === 'string') {
      const stateMap: Record<string, VideoStatusResult['status']> = {
        STATE_UNSPECIFIED: 'pending',
        PENDING: 'pending',
        RUNNING: 'processing',
        SUCCEEDED: 'succeeded',
        FAILED: 'failed',
        CANCELLED: 'cancelled',
      };
      return stateMap[state.toUpperCase()] || 'processing';
    }

    return 'processing';
  }

  private estimateProcessingTime(duration: number): number {
    // Veo typically takes ~60 seconds per second of video
    return Math.max(60, duration * 60);
  }
}

export const veoProvider = new VeoProvider();
