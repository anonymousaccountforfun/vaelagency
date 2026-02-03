import { describe, it, expect } from 'vitest';
import { providerRegistry } from '../index';

describe('Pika provider integration', () => {
  it('should be registered in the provider registry', () => {
    const providers = providerRegistry.listAll();
    const pika = providers.find((p) => p.id === 'pika');

    expect(pika).toBeDefined();
    expect(pika?.name).toBe('Pika AI');
  });

  it('should be selectable by registry', () => {
    const provider = providerRegistry.get('pika');

    expect(provider).toBeDefined();
    expect(provider?.id).toBe('pika');
  });

  it('should appear in image-to-video capable providers', () => {
    const providers = providerRegistry.listAll().filter(
      (p) => p.capabilities.imageToVideo
    );

    expect(providers.some((p) => p.id === 'pika')).toBe(true);
  });

  it('should have models accessible via provider', () => {
    const provider = providerRegistry.get('pika');
    expect(provider).toBeDefined();

    // Models are accessible via the provider directly
    const pikaModels = provider!.models;

    expect(pikaModels.length).toBeGreaterThan(0);
    expect(pikaModels.some((m) => m.id === 'pika-1.5')).toBe(true);
  });
});
