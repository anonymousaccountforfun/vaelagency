import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SoraProvider, soraProvider, SORA_MODELS } from '../sora';
import type { VideoGenerateParams } from '../../types';

describe('SORA_MODELS', () => {
  it('should have both sora-2 and sora-2-pro models', () => {
    const modelIds = SORA_MODELS.map((m) => m.id);
    expect(modelIds).toContain('sora-2');
    expect(modelIds).toContain('sora-2-pro');
    expect(SORA_MODELS.length).toBe(2);
  });

  it('should have valid model structure for all models', () => {
    SORA_MODELS.forEach((model) => {
      expect(model.id).toBeTruthy();
      expect(model.providerId).toBe('sora');
      expect(model.name).toBeTruthy();
      expect(model.displayName).toBeTruthy();
      expect(model.description).toBeTruthy();
      expect(model.costPerSecond).toBeGreaterThan(0);
      expect(model.defaultDuration).toBeGreaterThan(0);
      expect(model.maxDuration).toBeGreaterThan(0);
      expect(model.aspectRatios.length).toBeGreaterThan(0);
      expect(['budget', 'standard', 'premium']).toContain(model.qualityTier);
      expect(model.bestFor.length).toBeGreaterThan(0);
    });
  });

  it('should have sora-2-pro as premium tier', () => {
    const proPlan = SORA_MODELS.find((m) => m.id === 'sora-2-pro');
    expect(proPlan).toBeDefined();
    expect(proPlan!.qualityTier).toBe('premium');
  });

  it('should have sora-2 as standard tier', () => {
    const standardModel = SORA_MODELS.find((m) => m.id === 'sora-2');
    expect(standardModel).toBeDefined();
    expect(standardModel!.qualityTier).toBe('standard');
  });

  it('should have max duration of 12 seconds for all models', () => {
    SORA_MODELS.forEach((model) => {
      expect(model.maxDuration).toBe(12);
    });
  });

  it('should have correct cost per second values', () => {
    const sora2 = SORA_MODELS.find((m) => m.id === 'sora-2');
    const sora2Pro = SORA_MODELS.find((m) => m.id === 'sora-2-pro');

    expect(sora2!.costPerSecond).toBe(0.10);
    expect(sora2Pro!.costPerSecond).toBe(0.25);
  });

  it('should support imageToVideo for all models', () => {
    SORA_MODELS.forEach((model) => {
      expect(model.supportsImageToVideo).toBe(true);
    });
  });
});

describe('SoraProvider', () => {
  let provider: SoraProvider;

  beforeEach(() => {
    provider = new SoraProvider();
    vi.stubEnv('OPENAI_API_KEY', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('configuration', () => {
    it('should have correct provider id', () => {
      expect(provider.id).toBe('sora');
    });

    it('should have correct name', () => {
      expect(provider.name).toBe('OpenAI Sora');
    });

    it('should have defined capabilities', () => {
      expect(provider.capabilities.textToVideo).toBe(true);
      expect(provider.capabilities.imageToVideo).toBe(true);
      expect(provider.capabilities.videoToVideo).toBe(true);
      expect(provider.capabilities.lipSync).toBe(true);
      expect(provider.capabilities.characterReference).toBe(false);
      expect(provider.capabilities.keyframes).toBe(false);
    });

    it('should have both models available', () => {
      expect(provider.models.length).toBe(2);
    });
  });

  describe('isConfigured', () => {
    it('should return false when API key is not set', () => {
      expect(provider.isConfigured()).toBe(false);
    });

    it('should return true when API key is set', () => {
      vi.stubEnv('OPENAI_API_KEY', 'test-api-key');
      expect(provider.isConfigured()).toBe(true);
    });

    it('should return false for empty string API key', () => {
      vi.stubEnv('OPENAI_API_KEY', '');
      expect(provider.isConfigured()).toBe(false);
    });
  });

  describe('estimateCost', () => {
    it('should estimate cost based on duration for sora-2', () => {
      const params: VideoGenerateParams = {
        prompt: 'Test video',
        model: 'sora-2',
        duration: 8,
        aspectRatio: '16:9',
      };

      const estimate = provider.estimateCost(params);

      // 8 seconds * $0.10/sec = $0.80
      expect(estimate.amount).toBe(0.80);
      expect(estimate.currency).toBe('USD');
      expect(estimate.breakdown.baseCost).toBe(0.80);
      expect(estimate.breakdown.qualityMultiplier).toBe(1.0);
    });

    it('should apply 1.5x quality multiplier for sora-2-pro', () => {
      const params: VideoGenerateParams = {
        prompt: 'Test video',
        model: 'sora-2-pro',
        duration: 8,
        aspectRatio: '16:9',
      };

      const estimate = provider.estimateCost(params);

      // 8 seconds * $0.25/sec = $2.00 base, * 1.5 = $3.00
      expect(estimate.breakdown.baseCost).toBe(2.00);
      expect(estimate.breakdown.qualityMultiplier).toBe(1.5);
      expect(estimate.amount).toBe(3.00);
    });

    it('should normalize duration 5 to nearest valid (4)', () => {
      const params: VideoGenerateParams = {
        prompt: 'Test video',
        model: 'sora-2',
        duration: 5,
        aspectRatio: '16:9',
      };

      const estimate = provider.estimateCost(params);

      // 5 is closest to 4, so 4 * $0.10 = $0.40
      expect(estimate.amount).toBe(0.40);
    });

    it('should normalize duration 6 to nearest valid (8)', () => {
      const params: VideoGenerateParams = {
        prompt: 'Test video',
        model: 'sora-2',
        duration: 6,
        aspectRatio: '16:9',
      };

      const estimate = provider.estimateCost(params);

      // 6 is closest to 8 (equidistant rounds up), so 8 * $0.10 = $0.80
      expect(estimate.amount).toBe(0.80);
    });

    it('should normalize duration 10 to nearest valid (12)', () => {
      const params: VideoGenerateParams = {
        prompt: 'Test video',
        model: 'sora-2',
        duration: 10,
        aspectRatio: '16:9',
      };

      const estimate = provider.estimateCost(params);

      // 10 is closest to 12, so 12 * $0.10 = $1.20
      expect(estimate.amount).toBeCloseTo(1.20, 2);
    });

    it('should cap duration at max (12) even if requested higher', () => {
      const params: VideoGenerateParams = {
        prompt: 'Test video',
        model: 'sora-2',
        duration: 20,
        aspectRatio: '16:9',
      };

      const estimate = provider.estimateCost(params);

      // 20 > 12, normalized to 12, so 12 * $0.10 = $1.20
      expect(estimate.amount).toBeCloseTo(1.20, 2);
    });

    it('should throw error for unknown model', () => {
      const params: VideoGenerateParams = {
        prompt: 'Test video',
        model: 'unknown-model',
        duration: 8,
        aspectRatio: '16:9',
      };

      expect(() => provider.estimateCost(params)).toThrow('[Sora] Unknown model: unknown-model');
    });
  });

  describe('healthCheck', () => {
    it('should return unavailable when not configured', async () => {
      const status = await provider.healthCheck();

      expect(status.available).toBe(false);
      expect(status.message).toContain('not configured');
    });
  });
});

describe('soraProvider singleton', () => {
  it('should be exported as singleton', () => {
    expect(soraProvider).toBeInstanceOf(SoraProvider);
  });

  it('should have the correct provider id', () => {
    expect(soraProvider.id).toBe('sora');
  });
});
