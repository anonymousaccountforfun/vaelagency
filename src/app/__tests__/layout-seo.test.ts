import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

describe('vaelagency layout vertical targeting', () => {
  const layoutSource = readFileSync(join(__dirname, '../layout.tsx'), 'utf-8')

  it('does not mention generic consumer brands', () => {
    expect(layoutSource).not.toMatch(/consumer brands/i)
  })

  it('metadata description mentions hotels', () => {
    expect(layoutSource.toLowerCase()).toMatch(/hotel/)
  })

  it('metadata description mentions hospitality', () => {
    expect(layoutSource.toLowerCase()).toMatch(/hospitality/)
  })

  it('metadata description mentions fashion', () => {
    expect(layoutSource.toLowerCase()).toMatch(/fashion/)
  })

  it('keywords include hotel-related terms', () => {
    expect(layoutSource.toLowerCase()).toMatch(/hotel marketing|hospitality|boutique/)
  })

  it('JSON-LD serviceType includes hotel/hospitality terms', () => {
    expect(layoutSource.toLowerCase()).toMatch(/hotel.*marketing|hospitality.*marketing/)
  })

  it('JSON-LD knowsAbout includes vertical-specific topics', () => {
    expect(layoutSource.toLowerCase()).toMatch(/hotel.*photography|property.*marketing|fashion.*brand/)
  })
})
