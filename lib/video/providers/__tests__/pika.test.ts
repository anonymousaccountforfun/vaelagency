import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PikaProvider, pikaProvider, PIKA_MODELS } from '../pika';
import type { VideoGenerateParams } from '../../types';

describe('PIKA_MODELS', () => {
  it('should have at least one model defined', () => {
    expect(PIKA_MODELS.length).toBeGreaterThanOrEqual(1);
  });

  it('should have valid model structure', () => {
    PIKA_MODELS.forEach((model) => {
      expect(model.id).toBeTruthy();
      expect(model.providerId).toBe('pika');
      expect(model.name).toBeTruthy();
      expect(model.costPerSecond).toBeGreaterThan(0);
      expect(model.maxDuration).toBeGreaterThan(0);
      expect(model.aspectRatios.length).toBeGreaterThan(0);
      expect(['budget', 'standard', 'premium']).toContain(model.qualityTier);
    });
  });
});

describe('PikaProvider', () => {
  let provider: PikaProvider;

  beforeEach(() => {
    provider = new PikaProvider();
    vi.stubEnv('PIKA_API_KEY', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('configuration', () => {
    it('should have correct provider id', () => {
      expect(provider.id).toBe('pika');
    });

    it('should have correct name', () => {
      expect(provider.name).toBe('Pika AI');
    });

    it('should have defined capabilities', () => {
      expect(provider.capabilities.textToVideo).toBe(true);
      expect(provider.capabilities.imageToVideo).toBe(true);
      expect(provider.capabilities.videoToVideo).toBe(false);
    });
  });

  describe('isConfigured', () => {
    it('should return false when API key is not set', () => {
      expect(provider.isConfigured()).toBe(false);
    });

    it('should return true when API key is set', () => {
      vi.stubEnv('PIKA_API_KEY', 'test-api-key');
      expect(provider.isConfigured()).toBe(true);
    });
  });

  describe('estimateCost', () => {
    it('should estimate cost based on duration', () => {
      const params: VideoGenerateParams = {
        prompt: 'Test video',
        model: 'pika-1.5',
        duration: 5,
        aspectRatio: '16:9',
      };

      const estimate = provider.estimateCost(params);

      expect(estimate.amount).toBeGreaterThan(0);
      expect(estimate.currency).toBe('USD');
      expect(estimate.breakdown.baseCost).toBeGreaterThan(0);
    });

    it('should cap duration at model max', () => {
      const model = PIKA_MODELS[0];
      const params: VideoGenerateParams = {
        prompt: 'Test video',
        model: model.id,
        duration: model.maxDuration + 10,
        aspectRatio: '16:9',
      };

      const estimate = provider.estimateCost(params);
      const maxCost = model.costPerSecond * model.maxDuration;

      expect(estimate.amount).toBeLessThanOrEqual(maxCost * 1.5); // Allow for multipliers
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

describe('pikaProvider singleton', () => {
  it('should be exported as singleton', () => {
    expect(pikaProvider).toBeInstanceOf(PikaProvider);
  });
});
