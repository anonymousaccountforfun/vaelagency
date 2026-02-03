// dashboard/lib/video/providers/__tests__/veo.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { VeoProvider, veoProvider, VEO_MODELS } from '../veo';
import type { VideoGenerateParams } from '../../types';

describe('VEO_MODELS', () => {
  it('should have exactly 3 models defined', () => {
    expect(VEO_MODELS.length).toBe(3);
  });

  it('should have valid model structure', () => {
    VEO_MODELS.forEach((model) => {
      expect(model.id).toBeTruthy();
      expect(model.providerId).toBe('veo');
      expect(model.name).toBeTruthy();
      expect(model.displayName).toBeTruthy();
      expect(model.description).toBeTruthy();
      expect(model.costPerSecond).toBeGreaterThan(0);
      expect(model.maxDuration).toBeGreaterThan(0);
      expect(model.aspectRatios.length).toBeGreaterThan(0);
      expect(['budget', 'standard', 'premium']).toContain(model.qualityTier);
    });
  });

  it('should have veo-3.1 as premium tier', () => {
    const veo31 = VEO_MODELS.find((m) => m.id === 'veo-3.1');
    expect(veo31).toBeDefined();
    expect(veo31!.qualityTier).toBe('premium');
  });

  it('should have veo-3 as standard tier', () => {
    const veo3 = VEO_MODELS.find((m) => m.id === 'veo-3');
    expect(veo3).toBeDefined();
    expect(veo3!.qualityTier).toBe('standard');
  });

  it('should have veo-3.1-fast as budget tier', () => {
    const veo31Fast = VEO_MODELS.find((m) => m.id === 'veo-3.1-fast');
    expect(veo31Fast).toBeDefined();
    expect(veo31Fast!.qualityTier).toBe('budget');
  });

  it('should have 8 second max duration for all models', () => {
    VEO_MODELS.forEach((model) => {
      expect(model.maxDuration).toBe(8);
    });
  });

  it('should have correct cost per second for veo-3', () => {
    const veo3 = VEO_MODELS.find((m) => m.id === 'veo-3');
    expect(veo3!.costPerSecond).toBe(0.08);
  });

  it('should have correct cost per second for veo-3.1', () => {
    const veo31 = VEO_MODELS.find((m) => m.id === 'veo-3.1');
    expect(veo31!.costPerSecond).toBe(0.15);
  });

  it('should have correct cost per second for veo-3.1-fast', () => {
    const veo31Fast = VEO_MODELS.find((m) => m.id === 'veo-3.1-fast');
    expect(veo31Fast!.costPerSecond).toBe(0.06);
  });
});

describe('VeoProvider', () => {
  let provider: VeoProvider;

  beforeEach(() => {
    provider = new VeoProvider();
    vi.stubEnv('GOOGLE_AI_API_KEY', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('configuration', () => {
    it('should have correct provider id', () => {
      expect(provider.id).toBe('veo');
    });

    it('should have correct name', () => {
      expect(provider.name).toBe('Google Veo');
    });

    it('should have correct capabilities', () => {
      expect(provider.capabilities.textToVideo).toBe(true);
      expect(provider.capabilities.imageToVideo).toBe(true);
      expect(provider.capabilities.videoToVideo).toBe(false);
      expect(provider.capabilities.lipSync).toBe(true);
      expect(provider.capabilities.characterReference).toBe(false);
      expect(provider.capabilities.keyframes).toBe(false);
    });

    it('should expose all models', () => {
      expect(provider.models).toEqual(VEO_MODELS);
      expect(provider.models.length).toBe(3);
    });
  });

  describe('isConfigured', () => {
    it('should return false when API key is not set', () => {
      expect(provider.isConfigured()).toBe(false);
    });

    it('should return true when API key is set', () => {
      vi.stubEnv('GOOGLE_AI_API_KEY', 'test-google-api-key');
      expect(provider.isConfigured()).toBe(true);
    });

    it('should return false when API key is empty string', () => {
      vi.stubEnv('GOOGLE_AI_API_KEY', '');
      expect(provider.isConfigured()).toBe(false);
    });
  });

  describe('estimateCost', () => {
    it('should estimate cost based on duration for veo-3', () => {
      const params: VideoGenerateParams = {
        prompt: 'Test video',
        model: 'veo-3',
        duration: 5,
        aspectRatio: '16:9',
      };

      const estimate = provider.estimateCost(params);

      expect(estimate.amount).toBe(0.08 * 5); // $0.08/sec * 5 seconds
      expect(estimate.currency).toBe('USD');
      expect(estimate.breakdown.baseCost).toBe(0.08 * 5);
      expect(estimate.breakdown.qualityMultiplier).toBe(1.0);
    });

    it('should apply 1.5x quality multiplier for premium model veo-3.1', () => {
      const params: VideoGenerateParams = {
        prompt: 'Test video',
        model: 'veo-3.1',
        duration: 5,
        aspectRatio: '16:9',
      };

      const estimate = provider.estimateCost(params);
      const expectedBase = 0.15 * 5;

      expect(estimate.breakdown.baseCost).toBe(expectedBase);
      expect(estimate.breakdown.qualityMultiplier).toBe(1.5);
      expect(estimate.amount).toBe(expectedBase * 1.5);
    });

    it('should estimate lower cost for budget model veo-3.1-fast', () => {
      const standardParams: VideoGenerateParams = {
        prompt: 'Test video',
        model: 'veo-3',
        duration: 5,
        aspectRatio: '16:9',
      };

      const budgetParams: VideoGenerateParams = {
        prompt: 'Test video',
        model: 'veo-3.1-fast',
        duration: 5,
        aspectRatio: '16:9',
      };

      const standardEstimate = provider.estimateCost(standardParams);
      const budgetEstimate = provider.estimateCost(budgetParams);

      expect(budgetEstimate.amount).toBeLessThan(standardEstimate.amount);
    });

    it('should cap duration at model max duration', () => {
      const params: VideoGenerateParams = {
        prompt: 'Test video',
        model: 'veo-3',
        duration: 20, // exceeds 8 second max
        aspectRatio: '16:9',
      };

      const estimate = provider.estimateCost(params);
      const maxCost = 0.08 * 8; // capped at 8 seconds

      expect(estimate.amount).toBe(maxCost);
    });

    it('should throw error for unknown model', () => {
      const params: VideoGenerateParams = {
        prompt: 'Test video',
        model: 'unknown-model',
        duration: 5,
        aspectRatio: '16:9',
      };

      expect(() => provider.estimateCost(params)).toThrow('[Veo] Unknown model');
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

describe('veoProvider singleton', () => {
  it('should be exported as singleton', () => {
    expect(veoProvider).toBeInstanceOf(VeoProvider);
  });

  it('should have correct id', () => {
    expect(veoProvider.id).toBe('veo');
  });
});
