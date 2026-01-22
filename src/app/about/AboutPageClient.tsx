'use client'

import { motion } from 'framer-motion'
import { FadeInSection } from '@/components/AnimatedSection'
import MediaRenderer from '@/components/MediaRenderer'
import { useContactModal } from '@/components/ContactModalContext'
import type { AboutPageData, SanityMedia } from '../../../sanity/lib/types'

// Helper function to highlight specific words in red
function highlightWord(text: string, word: string) {
  const parts = text.split(new RegExp(`(${word})`, 'gi'))
  return parts.map((part, i) =>
    part.toLowerCase() === word.toLowerCase()
      ? <span key={i} className="text-red-500">{part}</span>
      : part
  )
}

interface FounderWithMedia {
  name: string
  title: string
  bio: string
  companies: string[]
  media?: SanityMedia
}

interface AboutPageClientProps {
  content: AboutPageData
  foundersWithMedia: FounderWithMedia[]
}

export default function AboutPageClient({ content, foundersWithMedia }: AboutPageClientProps) {
  const { openModal } = useContactModal()

  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-background overflow-hidden">
        <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-stone-500 text-sm uppercase tracking-widest mb-6"
            >
              {content.hero.label}
            </motion.p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium text-stone-900 mb-6">
              {highlightWord(content.hero.headline, 'Team')}
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-lg md:text-xl text-stone-600 max-w-3xl mx-auto"
            >
              {content.hero.description}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Founders Section */}
      <section className="py-20 md:py-28 bg-background-secondary">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {foundersWithMedia.map((founder, index) => (
              <motion.div
                key={founder.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-sm"
              >
                {/* Photo/Video */}
                <div className="relative w-full bg-stone-100 flex items-center justify-center" style={{ aspectRatio: '154/215' }}>
                  {(founder.media?.type === 'video' || founder.media?.image) ? (
                    <MediaRenderer
                      media={founder.media}
                      fallbackUrl=""
                      alt={founder.name}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-stone-100 to-stone-200">
                      <span className="text-5xl font-semibold text-stone-300">
                        {founder.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-8 lg:p-10">
                  <h3 className="text-2xl font-semibold text-stone-900 mb-2">{founder.name}</h3>
                  <p className="text-stone-500 text-sm uppercase tracking-wider mb-6">{founder.title}</p>

                  <p className="text-stone-600 leading-relaxed mb-8">{founder.bio}</p>

                  {/* Company badges */}
                  <div className="flex flex-wrap gap-2">
                    {founder.companies?.map((company) => (
                      <span
                        key={company}
                        className="inline-flex items-center px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 text-xs font-medium"
                      >
                        {company}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Origin Story Section */}
      <section className="py-20 md:py-28 bg-background">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <FadeInSection>
            <p className="text-stone-500 text-sm uppercase tracking-widest mb-4 text-center">{content.story.label}</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium text-stone-900 mb-8 text-center">
              {highlightWord(content.story.headline, 'Vael')}
            </h2>
          </FadeInSection>

          <FadeInSection delay={0.2}>
            <div className="space-y-6">
              {content.story.paragraphs?.map((paragraph, index) => (
                <p key={index} className="text-stone-600 text-lg leading-relaxed">
                  {paragraph}
                </p>
              ))}

              {/* Pull quote */}
              <div className="my-12 py-8 border-l-4 border-stone-300 pl-8">
                <p className="text-2xl md:text-3xl font-medium text-stone-800 leading-relaxed italic">
                  &ldquo;{content.story.pullQuote}&rdquo;
                </p>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* Full-bleed Media */}
      {content.teamMedia && (
        <section className="relative h-[50vh] md:h-[60vh]">
          <MediaRenderer
            media={content.teamMedia}
            fallbackUrl=""
            alt="Team collaboration"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-stone-900/10 pointer-events-none" />
        </section>
      )}

      {/* CTA Section */}
      <section className="py-32 md:py-40 bg-warm-accent">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <FadeInSection>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium text-stone-900 mb-6">
              {highlightWord(content.cta.headline, 'together')}
            </h2>
            <p className="text-stone-600 text-lg mb-10 max-w-2xl mx-auto">
              {content.cta.description}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                onClick={openModal}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-8 py-4 bg-stone-900 text-white font-medium rounded-full hover:bg-stone-800 transition-colors"
              >
                {content.cta.primaryButtonText}
              </motion.button>
              <motion.a
                href={content.cta.secondaryButtonLink}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-8 py-4 bg-transparent text-stone-900 font-medium rounded-full border border-stone-400 hover:border-stone-500 hover:bg-white/50 transition-all"
              >
                {content.cta.secondaryButtonText}
              </motion.a>
            </div>
          </FadeInSection>
        </div>
      </section>
    </>
  )
}
