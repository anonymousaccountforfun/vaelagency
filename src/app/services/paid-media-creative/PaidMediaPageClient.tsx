'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { FadeInSection } from '@/components/AnimatedSection'
import { useContactModal } from '@/components/ContactModalContext'

const deliverables = [
  'Static ad variations (15+ assets, multiple sizes)',
  'Video ads (15s, 30s, 60s formats)',
  'UGC-style content (5+ pieces)',
  'A/B test creative variants',
  'Platform-specific optimizations',
]

const platforms = [
  { name: 'Meta', description: 'Feed, Stories, Reels' },
  { name: 'TikTok', description: 'In-feed, Spark Ads' },
  { name: 'Google', description: 'Display, YouTube' },
  { name: 'Pinterest', description: 'Standard, Video Pins' },
]

const faqs = [
  {
    question: 'What ad formats do you produce?',
    answer: 'We produce static ads in multiple sizes, video ads in 15s, 30s, and 60s formats, UGC-style content, and A/B test variants. All assets are optimized for Meta, TikTok, Google, and other paid channels.',
  },
  {
    question: 'How does AI-accelerated ad creative work?',
    answer: 'We use AI tools to accelerate production while our creative directors ensure every piece is on-brand and performance-ready. This allows us to deliver more creative variations faster than traditional agencies.',
  },
  {
    question: 'What is the turnaround time for paid media assets?',
    answer: 'Paid media asset packages are typically delivered within 4-6 business days, depending on scope. We work with you to determine the right timeline for your needs.',
  },
]

export default function PaidMediaPageClient() {
  const { openModal } = useContactModal()

  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-background overflow-hidden">
        <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8">
          {/* Breadcrumb */}
          <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <ol className="flex items-center gap-2 text-sm text-stone-500">
              <li>
                <Link href="/" className="hover:text-stone-900 transition-colors">
                  Home
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/services" className="hover:text-stone-900 transition-colors">
                  Services
                </Link>
              </li>
              <li>/</li>
              <li className="text-stone-900">Paid Media Creative</li>
            </ol>
          </motion.nav>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-stone-500 text-sm uppercase tracking-widest mb-6"
            >
              Ad Creative Production
            </motion.p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium text-stone-900 mb-6">
              Paid Media <span className="text-red-500">Creative</span>
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-lg md:text-xl text-stone-600 max-w-3xl mb-8"
            >
              Performance-optimized creative built for your paid acquisition channels.
              Every asset is designed to stop the scroll and drive conversions.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <motion.button
                onClick={openModal}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center px-8 py-4 bg-stone-900 text-white font-medium rounded-full hover:bg-stone-800 transition-colors"
              >
                Get Started
              </motion.button>
              <motion.a
                href="/services"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-stone-900 font-medium rounded-full border border-stone-300 hover:border-stone-400 hover:bg-stone-100/50 transition-all"
              >
                View All Services
              </motion.a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Deliverables Section */}
      <section className="py-20 md:py-28 bg-background-secondary">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <FadeInSection>
              <p className="text-stone-500 text-sm uppercase tracking-widest mb-4">What You Get</p>
              <h2 className="text-3xl md:text-4xl font-medium text-stone-900 mb-6">
                Everything you need for paid acquisition
              </h2>
              <p className="text-stone-600 text-lg mb-8">
                From static ads to video content, we produce the creative assets your growth team needs to test, iterate, and scale.
              </p>
              <div className="bg-white rounded-2xl p-6 border border-stone-200">
                <p className="text-xs uppercase tracking-wider text-stone-400 mb-4">Deliverables</p>
                <ul className="space-y-3">
                  {deliverables.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-stone-700">
                      <svg className="w-5 h-5 mt-0.5 text-stone-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeInSection>

            <FadeInSection delay={0.2}>
              <div className="bg-white rounded-2xl p-8 border border-stone-200">
                <p className="text-xs uppercase tracking-wider text-stone-400 mb-6">Platform Coverage</p>
                <div className="grid grid-cols-2 gap-4">
                  {platforms.map((platform) => (
                    <div key={platform.name} className="p-4 bg-stone-50 rounded-xl">
                      <p className="font-medium text-stone-900">{platform.name}</p>
                      <p className="text-sm text-stone-500">{platform.description}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-8 pt-6 border-t border-stone-200">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-stone-500">Typical Timeline</span>
                    <span className="font-medium text-stone-900">4-6 business days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-500">Ideal For</span>
                    <span className="font-medium text-stone-900">Performance marketing</span>
                  </div>
                </div>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-28 bg-background">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <FadeInSection className="text-center mb-16">
            <p className="text-stone-500 text-sm uppercase tracking-widest mb-4">Our Process</p>
            <h2 className="text-3xl md:text-4xl font-medium text-stone-900">
              How we work
            </h2>
          </FadeInSection>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Discovery', description: 'We review your brand guidelines, existing assets, and campaign goals.' },
              { step: '02', title: 'Strategy', description: 'We align on creative direction, formats, and timeline.' },
              { step: '03', title: 'Creation', description: 'AI-accelerated production with human creative direction and QA.' },
              { step: '04', title: 'Delivery', description: 'Polished, ready-to-launch assets with one round of revisions included.' },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 border border-stone-200"
              >
                <div className="text-3xl font-bold text-stone-200 mb-3">{item.step}</div>
                <h3 className="text-lg font-semibold text-stone-900 mb-2">{item.title}</h3>
                <p className="text-stone-600 text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-28 bg-background-secondary">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <FadeInSection className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-medium text-stone-900">
              Frequently asked questions
            </h2>
          </FadeInSection>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 border border-stone-200"
              >
                <h3 className="font-medium text-stone-900 mb-2">{faq.question}</h3>
                <p className="text-stone-600">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-warm-accent">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <FadeInSection>
            <h2 className="text-3xl md:text-4xl font-medium text-stone-900 mb-4">
              Ready to scale your ad creative?
            </h2>
            <p className="text-stone-600 text-lg mb-8 max-w-2xl mx-auto">
              Every project is custom. Let&apos;s discuss your goals and build a package that fits your needs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                onClick={openModal}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-8 py-4 bg-stone-900 text-white font-medium rounded-full hover:bg-stone-800 transition-colors"
              >
                Book a Call
              </motion.button>
              <motion.a
                href="/services"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-8 py-4 bg-transparent text-stone-900 font-medium rounded-full border border-stone-400 hover:border-stone-500 hover:bg-white/50 transition-all"
              >
                View All Services
              </motion.a>
            </div>
          </FadeInSection>
        </div>
      </section>
    </>
  )
}
