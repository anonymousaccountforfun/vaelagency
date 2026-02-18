import { describe, it, expect } from 'vitest'
import { GET } from '../llms.txt/route'

describe('vaelagency llms.txt', () => {
  it('returns a Response object', async () => {
    const response = await GET()
    expect(response).toBeInstanceOf(Response)
  })

  it('has text/plain content type', async () => {
    const response = await GET()
    expect(response.headers.get('content-type')).toContain('text/plain')
  })

  it('mentions Vael Creative', async () => {
    const response = await GET()
    const text = await response.text()
    expect(text).toContain('Vael Creative')
  })

  it('describes target verticals', async () => {
    const response = await GET()
    const text = await response.text()
    const lower = text.toLowerCase()
    expect(lower).toContain('hotel')
    expect(lower).toContain('hospitality')
    expect(lower).toContain('fashion')
  })

  it('mentions AI marketing', async () => {
    const response = await GET()
    const text = await response.text()
    expect(text.toLowerCase()).toMatch(/ai.*market|market.*ai/)
  })

  it('includes the URL', async () => {
    const response = await GET()
    const text = await response.text()
    expect(text).toContain('vaelcreative.com')
  })
})
