// dashboard/lib/video/registry.ts

import type {
  VideoProvider,
  VideoProviderId,
  VideoModelConfig,
  ProviderSelection,
  VideoGenerateParams
} from './types';

/**
 * Provider Registry
 *
 * Manages registration and discovery of video providers.
 */
class ProviderRegistry {
  private providers: Map<VideoProviderId, VideoProvider> = new Map();

  /**
   * Register a provider
   */
  register(provider: VideoProvider): void {
    this.providers.set(provider.id, provider);
  }

  /**
   * Get a provider by ID
   */
  get(id: VideoProviderId): VideoProvider | undefined {
    return this.providers.get(id);
  }

  /**
   * Get provider for a specific model
   */
  getProviderForModel(modelId: string): VideoProvider | undefined {
    for (const provider of this.providers.values()) {
      if (provider.models.some(m => m.id === modelId)) {
        return provider;
      }
    }
    return undefined;
  }

  /**
   * Get model config by ID
   */
  getModelConfig(modelId: string): VideoModelConfig | undefined {
    for (const provider of this.providers.values()) {
      const model = provider.models.find(m => m.id === modelId);
      if (model) return model;
    }
    return undefined;
  }

  /**
   * List all available providers (configured and healthy)
   */
  listAvailable(): VideoProvider[] {
    return Array.from(this.providers.values()).filter(p => p.isConfigured());
  }

  /**
   * List all registered providers
   */
  listAll(): VideoProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * List all available models across providers
   */
  listAllModels(): VideoModelConfig[] {
    const models: VideoModelConfig[] = [];
    for (const provider of this.providers.values()) {
      if (provider.isConfigured()) {
        models.push(...provider.models);
      }
    }
    return models;
  }

  /**
   * Find providers that meet capability requirements
   */
  findByCapabilities(params: VideoGenerateParams): VideoProvider[] {
    return this.listAvailable().filter(provider => {
      // Check image-to-video support
      if (params.startImage && !provider.capabilities.imageToVideo) {
        return false;
      }
      // Check character reference support
      if (params.referenceImages?.length && !provider.capabilities.characterReference) {
        return false;
      }
      // Check keyframe support
      if (params.endImage && !provider.capabilities.keyframes) {
        return false;
      }
      return true;
    });
  }

  /**
   * Select the best provider for given generation parameters.
   *
   * Selection priority:
   * 1. If `params.model` is specified, use the provider that owns that model
   * 2. If `preferences.preferredModel` is set, try that model's provider (if configured)
   * 3. Filter providers by required capabilities (image-to-video, character reference, keyframes)
   * 4. Sort remaining models by optimization preference:
   *    - 'cost': Sort by lowest costPerSecond first
   *    - 'quality' (default): Sort by quality tier (premium > standard > budget), then by cost
   * 5. Return the first (best) model and its provider
   *
   * @param params - Generation parameters including model, startImage, endImage, referenceImages
   * @param preferences - Optional preferences for model selection
   * @returns Provider and model selection with reason, or null if no capable provider found
   */
  selectProvider(
    params: VideoGenerateParams,
    preferences?: { preferredModel?: string; optimizeFor?: 'cost' | 'quality' }
  ): ProviderSelection | null {
    // If specific model requested, use that
    if (params.model) {
      const provider = this.getProviderForModel(params.model);
      const model = this.getModelConfig(params.model);
      if (provider && model) {
        return { provider, model, reason: 'User selected model' };
      }
    }

    // If preferred model set, try that first
    if (preferences?.preferredModel) {
      const provider = this.getProviderForModel(preferences.preferredModel);
      const model = this.getModelConfig(preferences.preferredModel);
      if (provider && model && provider.isConfigured()) {
        return { provider, model, reason: 'Client preferred model' };
      }
    }

    // Find capable providers
    const capable = this.findByCapabilities(params);
    if (capable.length === 0) {
      return null;
    }

    // Get all models from capable providers
    const models = capable.flatMap(p => p.models);

    // Sort by optimization preference
    if (preferences?.optimizeFor === 'cost') {
      models.sort((a, b) => a.costPerSecond - b.costPerSecond);
    } else {
      // Default: sort by quality tier, then cost
      const tierOrder = { premium: 0, standard: 1, budget: 2 };
      models.sort((a, b) => {
        const tierDiff = tierOrder[a.qualityTier] - tierOrder[b.qualityTier];
        if (tierDiff !== 0) return tierDiff;
        return a.costPerSecond - b.costPerSecond;
      });
    }

    const selectedModel = models[0];
    const provider = this.getProviderForModel(selectedModel.id)!;

    return {
      provider,
      model: selectedModel,
      reason: preferences?.optimizeFor === 'cost'
        ? 'Lowest cost available'
        : 'Best quality available'
    };
  }
}

// Singleton instance
export const providerRegistry = new ProviderRegistry();

// Export for testing
export { ProviderRegistry };
