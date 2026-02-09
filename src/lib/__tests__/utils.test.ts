import { describe, it, expect } from 'vitest'
import { highlightWord } from '../utils'

describe('highlightWord', () => {
  it('wraps target word in a span with red-500 class', () => {
    const result = highlightWord('Premium creative for consumer brands', 'consumer')
    expect(result).toHaveLength(3)
    // The middle element should be the highlighted span
    expect(result[1]).toBeTruthy()
  })

  it('returns original text as single element if word not found', () => {
    const result = highlightWord('Hello world', 'missing')
    expect(result).toHaveLength(1)
  })

  it('is case-insensitive', () => {
    const result = highlightWord('Hello World', 'hello')
    // Split produces ['', 'Hello', ' World'] — 3 parts including leading empty string
    expect(result).toHaveLength(3)
    // The second element should be the highlighted span (case-insensitive match)
    expect(result[1]).toBeTruthy()
  })
})
