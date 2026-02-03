// dashboard/lib/video/index.ts

/**
 * Video Generation Service
 *
 * Main entry point for video generation with multi-provider support.
 */

import { providerRegistry } from './registry';
import { replicateProvider } from './providers/replicate';
import { lumaProvider } from './providers/luma';
import { klingProvider } from './providers/kling';
import { runwayProvider } from './providers/runway';
import { pikaProvider } from './providers/pika';
import { soraProvider } from './providers/sora';
import { veoProvider } from './providers/veo';
import type {
  VideoGenerateParams,
  VideoJobResult,
  VideoStatusResult,
  VideoModelConfig,
  VideoProviderId,
  ProviderHealthStatus,
} from './types';

// Register all providers
providerRegistry.register(replicateProvider);
providerRegistry.register(lumaProvider);
providerRegistry.register(klingProvider);
providerRegistry.register(runwayProvider);
providerRegistry.register(pikaProvider);
providerRegistry.register(soraProvider);
providerRegistry.register(veoProvider);

/**
 * Check if any video provider is configured
 */
export function isVideoConfigured(): boolean {
  return providerRegistry.listAvailable().length > 0;
}

/**
 * Get all available video models
 */
export function getAvailableModels(): VideoModelConfig[] {
  return providerRegistry.listAllModels();
}

/**
 * Get a specific model by ID
 */
export function getModelConfig(modelId: string): VideoModelConfig | undefined {
  return providerRegistry.getModelConfig(modelId);
}

/**
 * Get default model (from env or first available premium)
 */
export function getDefaultModel(): string {
  const envModel = process.env.VIDEO_PREFERRED_MODEL;
  if (envModel && providerRegistry.getModelConfig(envModel)) {
    return envModel;
  }

  const models = getAvailableModels();
  const premium = models.find(m => m.qualityTier === 'premium');
  return premium?.id || models[0]?.id || 'minimax-video';
}

/**
 * Estimate cost for a video generation
 */
export function estimateCost(params: VideoGenerateParams): number {
  const selection = providerRegistry.selectProvider(params);
  if (!selection) {
    throw new Error('No provider available for these parameters');
  }
  return selection.provider.estimateCost(params).amount;
}

/**
 * Start video generation (async - returns immediately)
 */
export async function startVideoGeneration(
  params: VideoGenerateParams
): Promise<VideoJobResult> {
  const selection = providerRegistry.selectProvider(params);
  if (!selection) {
    throw new Error('No provider available for these parameters');
  }

  return selection.provider.generate(params);
}

/**
 * Check status of a video generation job
 */
export async function checkVideoStatus(
  jobId: string,
  providerId: VideoProviderId
): Promise<VideoStatusResult> {
  const provider = providerRegistry.get(providerId);
  if (!provider) {
    throw new Error(`Unknown provider: ${providerId}`);
  }
  return provider.checkStatus(jobId);
}

/**
 * Cancel a video generation job
 */
export async function cancelVideoJob(
  jobId: string,
  providerId: VideoProviderId
): Promise<void> {
  const provider = providerRegistry.get(providerId);
  if (!provider) {
    throw new Error(`Unknown provider: ${providerId}`);
  }
  return provider.cancel(jobId);
}

/**
 * Get health status of all providers
 */
export async function getProviderHealth(): Promise<
  Record<VideoProviderId, ProviderHealthStatus>
> {
  const results: Record<string, ProviderHealthStatus> = {};

  for (const provider of providerRegistry.listAll()) {
    results[provider.id] = await provider.healthCheck();
  }

  return results as Record<VideoProviderId, ProviderHealthStatus>;
}

// Re-export types
export * from './types';
export { providerRegistry } from './registry';
