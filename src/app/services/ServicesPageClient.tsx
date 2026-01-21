'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { FadeInSection, StaggerContainer, StaggerItem } from '@/components/AnimatedSection'
import type { ServicesPageData } from '../../../sanity/lib/types'

interface ServicesPageClientProps {
  content: ServicesPageData
  heroImageUrl: string
}

export default function ServicesPageClient({ content, heroImageUrl }: ServicesPageClientProps) {
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
              {content.hero.headline}
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

      {/* Full-bleed Image */}
      <section className="relative h-[40vh] md:h-[50vh]">
        <Image
          src={heroImageUrl}
          alt={content.heroImage?.alt || 'Creative process'}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-stone-900/10" />
      </section>

      {/* Packages Section */}
      <section className="py-32 md:py-40 bg-background-secondary">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="space-y-8">
            {content.packages.map((pkg, index) => (
              <motion.div
                key={pkg.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-3xl p-8 lg:p-10 border border-stone-200 hover:border-stone-300 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <div className="grid lg:grid-cols-5 gap-8">
                    {/* Package Info */}
                    <div className="lg:col-span-3">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <span className="text-stone-400 text-sm font-medium">
                            Package {String(index + 1).padStart(2, '0')}
                          </span>
                          <h3 className="text-2xl md:text-3xl font-semibold text-stone-900 mt-1">
                            {pkg.name}
                          </h3>
                        </div>
                      </div>

                      <p className="text-stone-600 text-lg leading-relaxed mb-6">
                        {pkg.description}
                      </p>

                      <div className="mb-6">
                        <p className="text-xs uppercase tracking-wider text-stone-400 mb-4">
                          Deliverables
                        </p>
                        <ul className="space-y-2">
                          {pkg.deliverables.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-stone-600">
                              <svg className="w-4 h-4 mt-0.5 text-stone-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-stone-500">Timeline:</span>
                          <span className="text-stone-700 font-medium">{pkg.timeline}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span className="text-stone-500">Ideal for:</span>
                          <span className="text-stone-700 font-medium">{pkg.ideal}</span>
                        </div>
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="lg:col-span-2 lg:border-l lg:border-stone-200 lg:pl-8 flex flex-col justify-center">
                      <div className="bg-stone-50 rounded-2xl p-6 text-center">
                        <p className="text-stone-500 text-sm mb-4">
                          Let&apos;s discuss your needs
                        </p>
                        <motion.a
                          href="#calendly"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="inline-flex items-center justify-center w-full px-6 py-3 bg-stone-900 text-white font-medium rounded-full hover:bg-stone-800 transition-colors"
                        >
                          Book Call
                        </motion.a>
                        <p className="text-stone-400 text-xs mt-4">
                          Custom pricing based on scope
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-32 md:py-40 bg-background">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <FadeInSection className="text-center mb-16">
            <p className="text-stone-500 text-sm uppercase tracking-widest mb-4">{content.process.label}</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium text-stone-900 mb-6">
              {content.process.headline}
            </h2>
            <p className="text-stone-600 text-lg max-w-2xl mx-auto">
              {content.process.description}
            </p>
          </FadeInSection>

          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {content.process.steps.map((step, index) => (
              <StaggerItem key={step.step}>
                <motion.div
                  whileHover={{ y: -8 }}
                  className="relative bg-white rounded-2xl p-8 border border-stone-200 h-full group shadow-sm hover:shadow-md transition-all"
                >
                  {/* Connector line */}
                  {index < content.process.steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-stone-200" />
                  )}

                  <div className="text-4xl font-bold text-stone-200 mb-4 group-hover:text-stone-300 transition-colors">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold text-stone-900 mb-3">{step.title}</h3>
                  <p className="text-stone-600 text-sm leading-relaxed">{step.description}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Custom Package CTA */}
      <section className="py-32 md:py-40 bg-warm-accent">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <FadeInSection>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium text-stone-900 mb-4">
              {content.cta.headline}
            </h2>
            <p className="text-stone-600 text-lg mb-10 max-w-2xl mx-auto">
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
