import { describe, it, expect } from 'vitest';
import { providerRegistry } from '../index';

describe('Sora provider integration', () => {
  it('should be registered in the provider registry', () => {
    const providers = providerRegistry.listAll();
    const sora = providers.find((p) => p.id === 'sora');

    expect(sora).toBeDefined();
    expect(sora?.name).toBe('OpenAI Sora');
  });

  it('should be selectable by registry', () => {
    const provider = providerRegistry.get('sora');

    expect(provider).toBeDefined();
    expect(provider?.id).toBe('sora');
  });

  it('should appear in text-to-video capable providers', () => {
    const providers = providerRegistry.listAll().filter(
      (p) => p.capabilities.textToVideo
    );

    expect(providers.some((p) => p.id === 'sora')).toBe(true);
  });

  it('should appear in video-to-video capable providers', () => {
    const providers = providerRegistry.listAll().filter(
      (p) => p.capabilities.videoToVideo
    );

    expect(providers.some((p) => p.id === 'sora')).toBe(true);
  });

  it('should appear in lip-sync capable providers', () => {
    const providers = providerRegistry.listAll().filter(
      (p) => p.capabilities.lipSync
    );

    expect(providers.some((p) => p.id === 'sora')).toBe(true);
  });

  it('should have models accessible via provider', () => {
    const provider = providerRegistry.get('sora');
    expect(provider).toBeDefined();

    const soraModels = provider!.models;

    expect(soraModels.length).toBeGreaterThan(0);
    expect(soraModels.some((m) => m.id === 'sora-2')).toBe(true);
    expect(soraModels.some((m) => m.id === 'sora-2-pro')).toBe(true);
  });
});
