import { describe, it, expect } from 'vitest'

describe('vitest setup', () => {
  it('runs tests', () => {
    expect(1 + 1).toBe(2)
  })

  it('resolves @ alias', async () => {
    // Import a pure TS module via @ alias to verify path resolution
    const mod = await import('@/lib/insights-api')
    expect(mod.getInsights).toBeDefined()
    expect(typeof mod.getInsights).toBe('function')
  })
})
