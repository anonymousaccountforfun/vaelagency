import { describe, it, expect } from 'vitest';
import { providerRegistry } from '../index';

describe('Veo provider integration', () => {
  it('should be registered in the provider registry', () => {
    const providers = providerRegistry.listAll();
    const veo = providers.find((p) => p.id === 'veo');

    expect(veo).toBeDefined();
    expect(veo?.name).toBe('Google Veo');
  });

  it('should be selectable by registry', () => {
    const provider = providerRegistry.get('veo');

    expect(provider).toBeDefined();
    expect(provider?.id).toBe('veo');
  });

  it('should appear in text-to-video capable providers', () => {
    const providers = providerRegistry.listAll().filter(
      (p) => p.capabilities.textToVideo
    );

    expect(providers.some((p) => p.id === 'veo')).toBe(true);
  });

  it('should appear in image-to-video capable providers', () => {
    const providers = providerRegistry.listAll().filter(
      (p) => p.capabilities.imageToVideo
    );

    expect(providers.some((p) => p.id === 'veo')).toBe(true);
  });

  it('should appear in lip-sync capable providers', () => {
    const providers = providerRegistry.listAll().filter(
      (p) => p.capabilities.lipSync
    );

    expect(providers.some((p) => p.id === 'veo')).toBe(true);
  });

  it('should have models accessible via provider', () => {
    const provider = providerRegistry.get('veo');
    expect(provider).toBeDefined();

    const veoModels = provider!.models;

    expect(veoModels.length).toBeGreaterThan(0);
    expect(veoModels.some((m) => m.id === 'veo-3')).toBe(true);
    expect(veoModels.some((m) => m.id === 'veo-3.1')).toBe(true);
  });
});
