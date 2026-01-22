'use client'

import { motion } from 'framer-motion'
import MediaRenderer from './MediaRenderer'
import type { SanityMedia } from '../../sanity/lib/types'

interface ServiceCardProps {
  title: string
  description: string
  deliverables: string[]
  index: number
  media?: SanityMedia
}

export default function ServiceCard({ title, description, deliverables, index, media }: ServiceCardProps) {
  const hasMedia = media?.type === 'video' || media?.image

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="group relative bg-white rounded-2xl overflow-hidden border border-stone-200 hover:border-stone-300 transition-all duration-300 shadow-sm hover:shadow-md"
    >
      {/* Image/Video area */}
      <div className="relative h-48 bg-gradient-to-br from-stone-100 to-warm-accent overflow-hidden">
        {hasMedia ? (
          <MediaRenderer
            media={media}
            fallbackUrl=""
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/50 flex items-center justify-center">
              <span className="text-2xl font-semibold text-stone-400">
                {String(index + 1).padStart(2, '0')}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="p-8">
        <h3 className="text-xl font-semibold text-stone-900 mb-3 group-hover:text-stone-700 transition-colors duration-300">
          {title}
        </h3>

        <p className="text-stone-600 text-sm mb-6 leading-relaxed">
          {description}
        </p>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-stone-400 mb-3">Deliverables</p>
          <ul className="space-y-2">
            {deliverables.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-stone-600">
                <span className="text-stone-300 mt-1">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  )
}
