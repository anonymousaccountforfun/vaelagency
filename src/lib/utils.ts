import React from 'react'

/**
 * Wraps the first occurrence of `word` in a headline with a red-highlighted span.
 * Used across homepage, about, services, and other page client components.
 */
export function highlightWord(text: string, word: string): React.ReactNode[] {
  const parts = text.split(new RegExp(`(${word})`, 'i'))
  return parts.map((part, i) =>
    part.toLowerCase() === word.toLowerCase()
      ? React.createElement('span', { key: i, className: 'text-red-500' }, part)
      : React.createElement(React.Fragment, { key: i }, part)
  )
}
