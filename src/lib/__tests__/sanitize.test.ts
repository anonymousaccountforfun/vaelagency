import { describe, it, expect } from 'vitest'
import sanitizeHtml from 'sanitize-html'

describe('blog body sanitization', () => {
  it('strips script tags', () => {
    const dirty = '<p>Hello</p><script>alert("xss")</script>'
    const clean = sanitizeHtml(dirty)
    expect(clean).not.toContain('<script>')
    expect(clean).toContain('<p>Hello</p>')
  })

  it('preserves headings and paragraphs', () => {
    const html = '<h2>Title</h2><p>Content</p>'
    const clean = sanitizeHtml(html, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h1', 'h2', 'h3']),
    })
    expect(clean).toContain('<h2>')
    expect(clean).toContain('<p>')
  })

  it('filters out Word Count metadata', () => {
    const html = '<p>Article content</p><p>"Word Count: ~415 words"</p>'
    const filtered = html.replace(/<p[^>]*>\s*"?Word Count:[^<]*<\/p>/gi, '')
    expect(filtered).not.toContain('Word Count')
    expect(filtered).toContain('Article content')
  })

  it('preserves images with allowed attributes only', () => {
    const html = '<img src="test.jpg" alt="test" onerror="alert(1)" />'
    const clean = sanitizeHtml(html, {
      allowedTags: ['img'],
      allowedAttributes: { img: ['src', 'alt'] },
    })
    expect(clean).toContain('src="test.jpg"')
    expect(clean).toContain('alt="test"')
    expect(clean).not.toContain('onerror')
  })

  it('strips event handlers from all elements', () => {
    const html = '<div onclick="alert(1)"><a href="test" onmouseover="alert(2)">link</a></div>'
    const clean = sanitizeHtml(html)
    expect(clean).not.toContain('onclick')
    expect(clean).not.toContain('onmouseover')
  })

  it('handles empty/null body gracefully', () => {
    expect(sanitizeHtml('')).toBe('')
    expect(sanitizeHtml(undefined as unknown as string)).toBeDefined()
  })
})
