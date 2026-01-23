'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FadeInSection, StaggerContainer, StaggerItem } from '@/components/AnimatedSection'
import ServiceCard from '@/components/ServiceCard'
import MediaRenderer from '@/components/MediaRenderer'
import { urlFor } from '../../sanity/lib/client'
import type { HomepageData } from '../../sanity/lib/types'
import { useContactModal } from '@/components/ContactModalContext'

const FORMSPREE_ID = 'mjgygdpl'

interface HomePageClientProps {
  content: HomepageData
}

// Helper function to highlight specific words in red
function highlightWord(text: string, word: string) {
  const parts = text.split(new RegExp(`(${word})`, 'gi'))
  return parts.map((part, i) =>
    part.toLowerCase() === word.toLowerCase()
      ? <span key={i} className="text-red-500">{part}</span>
      : part
  )
}

export default function HomePageClient({ content }: HomePageClientProps) {
  const { openModal } = useContactModal()

  // Parse headline to handle line breaks
  const headlineParts = content.hero.headline.split('\n')

  // Check if hero has uploaded media
  const hasHeroMedia = content.heroMedia?.type === 'video' || content.heroMedia?.image

  return (
    <>
      {/* Hero Section with Full Background Media */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background: Either uploaded media or animated gradient fallback */}
        {hasHeroMedia ? (
          <>
            {/* Uploaded image/video background */}
            <div className="absolute inset-0">
              <MediaRenderer
                media={content.heroMedia}
                fallbackUrl=""
                alt="Hero background"
                fill
                className="object-cover"
                priority
              />
            </div>
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-black/40" />
          </>
        ) : (
          <>
            {/* Animated gradient background (fallback when no media uploaded) */}
            <div
              className="absolute inset-0 bg-gradient-to-br from-stone-200 via-amber-50 to-stone-300 animate-gradient-bg"
              style={{ backgroundSize: '200% 200%' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/5 to-transparent" />
            <div className="absolute inset-0 opacity-[0.015]" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }} />
          </>
        )}

        <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8 py-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <h1 className={`text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-medium leading-[1.05] mb-8 max-w-5xl mx-auto tracking-tight ${hasHeroMedia ? 'text-white' : 'text-stone-900'}`}>
              {headlineParts.map((part, i) => (
                <span key={i}>
                  {highlightWord(part, 'consumer')}
                  {i < headlineParts.length - 1 && <br />}
                </span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className={`text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed ${hasHeroMedia ? 'text-white/90' : 'text-stone-600'}`}
            >
              {content.hero.subheadline}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <motion.button
                onClick={openModal}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`inline-flex items-center px-8 py-4 font-medium rounded-full transition-colors ${hasHeroMedia ? 'bg-white text-stone-900 hover:bg-white/90' : 'bg-stone-900 text-white hover:bg-stone-800'}`}
              >
                {content.hero.primaryButtonText}
              </motion.button>
              <motion.a
                href={content.hero.secondaryButtonLink}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`inline-flex items-center px-8 py-4 bg-transparent font-medium rounded-full border transition-all ${hasHeroMedia ? 'text-white border-white/60 hover:border-white hover:bg-white/10' : 'text-stone-900 border-stone-300 hover:border-stone-400 hover:bg-stone-100/50'}`}
              >
                {content.hero.secondaryButtonText}
              </motion.a>
            </motion.div>
          </motion.div>

        </div>
      </section>

      {/* Services Section */}
      <section className="py-32 md:py-40 bg-background-secondary">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <FadeInSection className="text-center mb-20">
            <p className="text-stone-500 text-sm uppercase tracking-widest mb-4">{content.services.label}</p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium text-stone-900 mb-6">
              {highlightWord(content.services.headline, 'growth')}
            </h2>
            <p className="text-stone-600 text-lg max-w-2xl mx-auto">
              {content.services.description}
            </p>
          </FadeInSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {content.services.items.map((service, index) => (
              <ServiceCard
                key={service.title}
                title={service.title}
                description={service.description}
                deliverables={service.deliverables}
                index={index}
                media={service.media}
              />
            ))}
          </div>

          <FadeInSection delay={0.4} className="text-center mt-16">
            <motion.a
              href={content.services.buttonLink}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-8 py-4 bg-stone-900 text-white font-medium rounded-full hover:bg-stone-800 transition-colors"
            >
              {content.services.buttonText}
            </motion.a>
          </FadeInSection>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-32 md:py-40 bg-background">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <FadeInSection className="text-center mb-16">
            <p className="text-stone-500 text-sm uppercase tracking-widest mb-4">{content.socialProof.label}</p>
            <h2 className="text-3xl md:text-4xl font-medium text-stone-900 mb-6">
              {highlightWord(content.socialProof.headline, 'boldest')}
            </h2>
          </FadeInSection>

          <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
            {content.socialProof.companies.map((company) => {
              // Generate logo URL if logo exists
              let logoUrl: string | null = null
              try {
                if (company.logo?.asset) {
                  logoUrl = urlFor(company.logo).height(120).url()
                }
              } catch {
                logoUrl = null
              }

              // Size classes based on Sanity field
              const sizeClasses = {
                small: 'h-6 md:h-7',
                medium: 'h-8 md:h-9',
                large: 'h-10 md:h-11',
                xlarge: 'h-12 md:h-14',
                xxlarge: 'h-16 md:h-20',
                xxxlarge: 'h-20 md:h-24',
              }
              const sizeClass = sizeClasses[company.size || 'medium']

              return (
                <StaggerItem key={company.name}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center justify-center min-h-20 px-4"
                  >
                    {logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={logoUrl}
                        alt={company.logo?.alt || company.name}
                        className={`${sizeClass} w-auto object-contain opacity-60 hover:opacity-100 transition-opacity`}
                      />
                    ) : (
                      <span className="text-stone-400 text-sm font-semibold tracking-wider hover:text-stone-600 transition-colors">
                        {company.name.toUpperCase()}
                      </span>
                    )}
                  </motion.div>
                </StaggerItem>
              )
            })}
          </StaggerContainer>

          <FadeInSection delay={0.3} className="text-center mt-8">
            <p className="text-stone-400 text-sm">
              {content.socialProof.additionalText}
            </p>
          </FadeInSection>
        </div>
      </section>

      {/* NYC Focus Section */}
      <section className="py-32 md:py-40 bg-warm-accent relative overflow-hidden">
        <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <FadeInSection>
              <p className="text-stone-500 text-sm uppercase tracking-widest mb-4">{content.localExpertise.label}</p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium text-stone-900 mb-6 leading-tight">
                {highlightWord(content.localExpertise.headline, 'boldest')}
              </h2>
              <p className="text-stone-600 text-lg mb-8 leading-relaxed">
                {content.localExpertise.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  onClick={openModal}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center px-8 py-4 bg-stone-900 text-white font-medium rounded-full hover:bg-stone-800 transition-colors"
                >
                  {content.localExpertise.primaryButtonText}
                </motion.button>
                <motion.a
                  href={content.localExpertise.secondaryButtonLink}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center px-8 py-4 bg-transparent text-stone-900 font-medium rounded-full border border-stone-400 hover:border-stone-500 hover:bg-white/50 transition-all"
                >
                  {content.localExpertise.secondaryButtonText}
                </motion.a>
              </div>
            </FadeInSection>

            <FadeInSection delay={0.2}>
              <div className="grid grid-cols-2 gap-6">
                {content.localExpertise.stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200"
                  >
                    <p className="text-3xl md:text-4xl font-semibold text-stone-900 mb-2">{stat.number}</p>
                    <p className="text-stone-500 text-sm">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <CTASection content={content} />
    </>
  )
}

// CTA Section with contact form
function CTASection({ content }: { content: HomepageData }) {
  const { openModal } = useContactModal()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormState('submitting')

    try {
      const response = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, message }),
      })

      if (response.ok) {
        setFormState('success')
        setEmail('')
        setMessage('')
      } else {
        setFormState('error')
      }
    } catch {
      setFormState('error')
    }
  }

  return (
    <section className="py-32 md:py-40 bg-background">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <FadeInSection>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium text-stone-900 mb-6">
            {highlightWord(content.cta.headline, 'accelerate')}
          </h2>
          <p className="text-stone-600 text-lg mb-12 max-w-2xl mx-auto">
            {content.cta.description}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
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
              className="inline-flex items-center px-8 py-4 bg-transparent text-stone-900 font-medium rounded-full border border-stone-300 hover:border-stone-400 hover:bg-stone-100/50 transition-all"
            >
              {content.cta.secondaryButtonText}
            </motion.a>
          </div>

          {/* Contact Form */}
          <div className="max-w-xl mx-auto">
            <div className="bg-background-secondary rounded-2xl p-8 border border-stone-200">
              <h3 className="text-xl font-medium text-stone-900 mb-6">
                Or send us a message
              </h3>
              {formState === 'success' ? (
                <div className="py-8 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-stone-900 font-medium mb-2">Message sent!</p>
                  <p className="text-stone-600 text-sm">We&apos;ll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="cta-email" className="sr-only">Email</label>
                    <input
                      type="email"
                      id="cta-email"
                      name="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-stone-200 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="cta-message" className="sr-only">Message (optional)</label>
                    <textarea
                      id="cta-message"
                      name="message"
                      placeholder="Tell us about your project (optional)"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 bg-white border border-stone-200 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400 transition-colors resize-none"
                    />
                  </div>
                  {formState === 'error' && (
                    <p className="text-red-600 text-sm">Something went wrong. Please try again.</p>
                  )}
                  <motion.button
                    type="submit"
                    disabled={formState === 'submitting'}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-6 py-3 bg-stone-900 text-white font-medium rounded-lg hover:bg-stone-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {formState === 'submitting' ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Sending...
                      </>
                    ) : (
                      'Send Message'
                    )}
                  </motion.button>
                </form>
              )}
            </div>
          </div>
        </FadeInSection>
      </div>
    </section>
  )
}
