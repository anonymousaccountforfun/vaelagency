'use client'

import Image from 'next/image'
import Link from 'next/link'
import { PortableText, PortableTextComponents } from '@portabletext/react'
import { urlFor } from '../../sanity/lib/client'

interface CalloutBlock {
  _type: 'callout'
  type: 'info' | 'tip' | 'warning' | 'stat'
  content: string
}

const calloutStyles = {
  info: 'bg-blue-50 border-blue-200 text-blue-900',
  tip: 'bg-green-50 border-green-200 text-green-900',
  warning: 'bg-amber-50 border-amber-200 text-amber-900',
  stat: 'bg-stone-100 border-stone-300 text-stone-900 font-medium',
}

const calloutIcons = {
  info: '💡',
  tip: '✨',
  warning: '⚠️',
  stat: '📊',
}

const components: PortableTextComponents = {
  block: {
    h2: ({ children }) => (
      <h2 className="text-2xl md:text-3xl font-semibold text-stone-900 mt-12 mb-4">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl md:text-2xl font-semibold text-stone-900 mt-10 mb-3">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-lg md:text-xl font-semibold text-stone-900 mt-8 mb-2">
        {children}
      </h4>
    ),
    normal: ({ children }) => (
      <p className="text-stone-600 text-lg leading-relaxed mb-6">
        {children}
      </p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-stone-300 pl-6 my-8 italic text-stone-700 text-xl">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc list-outside pl-6 mb-6 space-y-2 text-stone-600 text-lg">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal list-outside pl-6 mb-6 space-y-2 text-stone-600 text-lg">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="leading-relaxed">{children}</li>,
    number: ({ children }) => <li className="leading-relaxed">{children}</li>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold text-stone-900">{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    code: ({ children }) => (
      <code className="bg-stone-100 px-1.5 py-0.5 rounded text-sm font-mono text-stone-800">
        {children}
      </code>
    ),
    link: ({ children, value }) => {
      const href = value?.href || ''
      const isExternal = href.startsWith('http')

      if (isExternal) {
        return (
          <a
            href={href}
            target={value?.openInNewTab ? '_blank' : undefined}
            rel={value?.openInNewTab ? 'noopener noreferrer' : undefined}
            className="text-stone-900 underline underline-offset-4 hover:text-red-500 transition-colors"
          >
            {children}
          </a>
        )
      }

      return (
        <Link
          href={href}
          className="text-stone-900 underline underline-offset-4 hover:text-red-500 transition-colors"
        >
          {children}
        </Link>
      )
    },
  },
  types: {
    image: ({ value }) => {
      if (!value?.asset) return null

      return (
        <figure className="my-10">
          <div className="relative aspect-video rounded-xl overflow-hidden bg-stone-100">
            <Image
              src={urlFor(value).width(1200).url()}
              alt={value.alt || 'Article image'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 800px"
            />
          </div>
          {value.caption && (
            <figcaption className="text-center text-stone-500 text-sm mt-3">
              {value.caption}
            </figcaption>
          )}
        </figure>
      )
    },
    callout: ({ value }: { value: CalloutBlock }) => {
      const style = calloutStyles[value.type] || calloutStyles.info
      const icon = calloutIcons[value.type] || calloutIcons.info

      return (
        <div className={`my-8 p-6 rounded-xl border ${style}`}>
          <span className="mr-2">{icon}</span>
          {value.content}
        </div>
      )
    },
  },
}

interface PortableTextRendererProps {
  value: Parameters<typeof PortableText>[0]['value']
}

export default function PortableTextRenderer({ value }: PortableTextRendererProps) {
  if (!value) return null
  return <PortableText value={value} components={components} />
}
