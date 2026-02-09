'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { FadeInSection, StaggerContainer, StaggerItem } from '@/components/AnimatedSection'
import MediaRenderer from '@/components/MediaRenderer'
import { useContactModal } from '@/components/ContactModalContext'
import { highlightWord } from '@/lib/utils'
import type { ServicesPageData } from '../../../sanity/lib/types'

interface ServicesPageClientProps {
  content: ServicesPageData
}

export default function ServicesPageClient({ content }: ServicesPageClientProps) {
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
              {highlightWord(content.hero.headline, 'scale')}
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

      {/* Packages Section */}
      <section className="py-32 md:py-40 bg-background-secondary">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="space-y-8">
            {(content.packages?.length > 0 ? content.packages : [
              {
                name: 'Brand & Identity',
                description: 'Everything you need to make a splash with your next product launch.',
                deliverables: ['Logo Design', 'Sonic Logos', 'Sound Design', 'Graphic Design', 'Web Design and Copy'],
                timeline: '2-4 weeks',
                ideal: 'New brands or rebrands',
              },
              {
                name: 'Content Production',
                description: 'High-volume, high-quality assets for your social media and website.',
                deliverables: ['Product Images', 'Lifestyle Photography', 'Product Videos', 'Short-Form Video', 'UGC-Style Content'],
                timeline: '1-2 weeks',
                ideal: 'Brands scaling content output',
              },
              {
                name: 'Digital & Growth',
                description: 'Assets and strategies designed to drive traffic and engagement.',
                deliverables: ['Social Media Content & Copy', 'Ad Creative', 'Email Design & Copy', 'Influencer Content'],
                timeline: 'Ongoing',
                ideal: 'Brands focused on acquisition',
              },
              {
                name: 'Custom',
                description: 'Partner with Vael Creative to design a custom package that fits your creative needs.',
                deliverables: ['Tailored to your needs', 'In your brand voice', 'On the timeline you require'],
                timeline: 'Flexible',
                ideal: 'Any brand with unique needs',
              },
            ]).map((pkg, index) => (
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
                  className="bg-white rounded-3xl overflow-hidden border border-stone-200 hover:border-stone-300 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  {/* Media Area */}
                  {(pkg.media?.type === 'video' || pkg.media?.image) ? (
                    <div className="relative h-48 md:h-56">
                      <MediaRenderer
                        media={pkg.media}
                        fallbackUrl=""
                        alt={pkg.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="relative h-48 md:h-56 bg-gradient-to-br from-stone-100 to-warm-accent flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full bg-white/50 flex items-center justify-center">
                        <span className="text-3xl font-semibold text-stone-400">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="p-8 lg:p-10">
                  <div className="grid lg:grid-cols-5 gap-8">
                    {/* Package Info */}
                    <div className="lg:col-span-3">
                      <h3 className="text-2xl md:text-3xl font-semibold text-stone-900 mb-4">
                        {pkg.name}
                      </h3>

                      <p className="text-stone-600 text-lg leading-relaxed mb-6">
                        {pkg.description}
                      </p>

                      {pkg.deliverables && pkg.deliverables.length > 0 && (
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
                      )}

                    </div>

                    {/* CTA */}
                    <div className="lg:col-span-2 lg:border-l lg:border-stone-200 lg:pl-8 flex flex-col justify-center">
                      <div className="bg-stone-50 rounded-2xl p-6 text-center">
                        <p className="text-stone-500 text-sm mb-4">
                          Let&apos;s discuss your needs
                        </p>
                        <motion.button
                          onClick={openModal}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="inline-flex items-center justify-center w-full px-6 py-3 bg-stone-900 text-white font-medium rounded-full hover:bg-stone-800 transition-colors"
                        >
                          Book Call
                        </motion.button>
                        <p className="text-stone-400 text-xs mt-4">
                          Custom pricing based on scope
                        </p>
                      </div>
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
            {(content.process?.steps?.length > 0 ? content.process.steps : [
              { step: '01', title: 'Discovery', description: 'We dive deep into your brand\u2014guidelines, voice, existing assets, and goals.' },
              { step: '02', title: 'Strategy', description: 'We recommend the right package and align on creative direction and timelines.' },
              { step: '03', title: 'Creation', description: 'We use cutting-edge technology and proven taste to curate and perfect every piece.' },
              { step: '04', title: 'Delivery', description: 'You receive polished, ready-to-use assets with one round of revisions included.' },
            ]).map((step, index) => (
              <StaggerItem key={step.step}>
                <motion.div
                  whileHover={{ y: -8 }}
                  className="relative bg-white rounded-2xl p-8 border border-stone-200 h-full group shadow-sm hover:shadow-md transition-all"
                >
                  <div className="text-4xl font-bold text-stone-200 mb-4 group-hover:text-stone-300 transition-colors">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold text-stone-900 mb-3">{step.title}</h3>
                  <p className="text-stone-600 text-sm leading-relaxed">{step.description}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <FadeInSection delay={0.3} className="text-center mt-12">
            <p className="text-stone-600">
              Want to learn more about who we are?{' '}
              <Link href="/about" className="text-stone-900 font-medium underline underline-offset-4 hover:text-red-500 transition-colors">
                Meet the team behind Vael
              </Link>
              .
            </p>
          </FadeInSection>
        </div>
      </section>

      {/* Custom Package CTA */}
      <section className="py-32 md:py-40 bg-warm-accent">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <FadeInSection>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium text-stone-900 mb-4">
              {highlightWord(content.cta.headline, 'custom')}
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
