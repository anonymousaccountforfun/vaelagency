'use client'

import { motion } from 'framer-motion'
import { FadeInSection, StaggerContainer, StaggerItem } from '@/components/AnimatedSection'
import ServiceCard from '@/components/ServiceCard'
import MediaRenderer from '@/components/MediaRenderer'
import type { HomepageData } from '../../sanity/lib/types'

interface HomePageClientProps {
  content: HomepageData
}

export default function HomePageClient({ content }: HomePageClientProps) {
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
                  {part}
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
              <motion.a
                href={content.hero.primaryButtonLink}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`inline-flex items-center px-8 py-4 font-medium rounded-full transition-colors ${hasHeroMedia ? 'bg-white text-stone-900 hover:bg-white/90' : 'bg-stone-900 text-white hover:bg-stone-800'}`}
              >
                {content.hero.primaryButtonText}
              </motion.a>
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
              {content.services.headline}
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
              {content.socialProof.headline}
            </h2>
          </FadeInSection>

          <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
            {content.socialProof.companies.map((company) => (
              <StaggerItem key={company.name}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center justify-center h-20 px-4"
                >
                  <span className="text-stone-400 text-sm font-semibold tracking-wider hover:text-stone-600 transition-colors">
                    {company.name.toUpperCase()}
                  </span>
                </motion.div>
              </StaggerItem>
            ))}
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
                {content.localExpertise.headline}
              </h2>
              <p className="text-stone-600 text-lg mb-8 leading-relaxed">
                {content.localExpertise.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.a
                  href={content.localExpertise.primaryButtonLink}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center px-8 py-4 bg-stone-900 text-white font-medium rounded-full hover:bg-stone-800 transition-colors"
                >
                  {content.localExpertise.primaryButtonText}
                </motion.a>
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

      {/* Another Full-bleed Media */}
      <section className="relative h-[50vh] md:h-[60vh]">
        <MediaRenderer
          media={content.secondMedia}
          fallbackUrl="https://images.unsplash.com/photo-1542744094-3a31f272c490?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
          alt="Brand products"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-stone-900/10 pointer-events-none" />
      </section>

      {/* Final CTA Section */}
      <section className="py-32 md:py-40 bg-background">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <FadeInSection>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium text-stone-900 mb-6">
              {content.cta.headline}
            </h2>
            <p className="text-stone-600 text-lg mb-12 max-w-2xl mx-auto">
              {content.cta.description}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.a
                href={content.cta.primaryButtonLink}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-8 py-4 bg-stone-900 text-white font-medium rounded-full hover:bg-stone-800 transition-colors"
              >
                {content.cta.primaryButtonText}
              </motion.a>
              <motion.a
                href={content.cta.secondaryButtonLink}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-8 py-4 bg-transparent text-stone-900 font-medium rounded-full border border-stone-300 hover:border-stone-400 hover:bg-stone-100/50 transition-all"
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
