import { describe, it, expect } from 'vitest'
import robots from '../robots'

describe('vaelagency robots.ts', () => {
  const config = robots()

  it('preserves default wildcard rule', () => {
    const rules = Array.isArray(config.rules) ? config.rules : [config.rules]
    const defaultRule = rules.find(r => r.userAgent === '*')
    expect(defaultRule).toBeDefined()
    expect(defaultRule!.allow).toBe('/')
    expect(defaultRule!.disallow).toContain('/studio/')
    expect(defaultRule!.disallow).toContain('/api/')
  })

  it('has explicit allow for GPTBot', () => {
    const rules = Array.isArray(config.rules) ? config.rules : [config.rules]
    const rule = rules.find(r => r.userAgent === 'GPTBot')
    expect(rule).toBeDefined()
    expect(rule!.allow).toBe('/')
  })

  it('has explicit allow for ClaudeBot', () => {
    const rules = Array.isArray(config.rules) ? config.rules : [config.rules]
    const rule = rules.find(r => r.userAgent === 'ClaudeBot')
    expect(rule).toBeDefined()
    expect(rule!.allow).toBe('/')
  })

  it('has explicit allow for PerplexityBot', () => {
    const rules = Array.isArray(config.rules) ? config.rules : [config.rules]
    const rule = rules.find(r => r.userAgent === 'PerplexityBot')
    expect(rule).toBeDefined()
    expect(rule!.allow).toBe('/')
  })

  it('preserves sitemap reference', () => {
    expect(config.sitemap).toBe('https://vaelcreative.com/sitemap.xml')
  })
})
