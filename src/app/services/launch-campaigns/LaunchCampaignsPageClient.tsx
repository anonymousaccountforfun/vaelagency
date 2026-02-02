'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { FadeInSection } from '@/components/AnimatedSection'
import { useContactModal } from '@/components/ContactModalContext'

const deliverables = [
  'Hero images & product photography (10+ variations)',
  'Launch video (30s + 60s cuts)',
  'Social media content suite (20+ assets)',
  'Launch copy & messaging framework',
  'Email announcement designs (3 templates)',
]

const faqs = [
  {
    question: 'What is included in a launch campaign package?',
    answer: 'Our launch campaign package includes hero images and product photography (10+ variations), launch videos in 30s and 60s cuts, a social media content suite (20+ assets), launch copy and messaging framework, and email announcement designs (3 templates).',
  },
  {
    question: 'How long does it take to produce launch campaign creative?',
    answer: 'Launch campaign packages are typically delivered within 5-7 business days. We work with you to determine the right timeline based on your launch date.',
  },
  {
    question: 'Can you work with our existing brand assets?',
    answer: 'Yes, we work with your existing brand guidelines and asset library to ensure all launch creative is on-brand and consistent with your established visual identity.',
  },
]

export default function LaunchCampaignsPageClient() {
  const { openModal } = useContactModal()

  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-background overflow-hidden">
        <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8">
          <motion.nav initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="mb-8">
            <ol className="flex items-center gap-2 text-sm text-stone-500">
              <li><Link href="/" className="hover:text-stone-900 transition-colors">Home</Link></li>
              <li>/</li>
              <li><Link href="/services" className="hover:text-stone-900 transition-colors">Services</Link></li>
              <li>/</li>
              <li className="text-stone-900">Launch Campaigns</li>
            </ol>
          </motion.nav>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.6 }} className="text-stone-500 text-sm uppercase tracking-widest mb-6">
              Launch Campaign Package
            </motion.p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium text-stone-900 mb-6">
              Launch <span className="text-red-500">Campaign</span> Creative
            </h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }} className="text-lg md:text-xl text-stone-600 max-w-3xl mb-8">
              Everything you need to make a splash with your next product launch. From hero imagery to launch videos, we create a cohesive creative suite that captures attention and drives action.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }} className="flex flex-col sm:flex-row gap-4">
              <motion.button onClick={openModal} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-flex items-center justify-center px-8 py-4 bg-stone-900 text-white font-medium rounded-full hover:bg-stone-800 transition-colors">
                Get Started
              </motion.button>
              <motion.a href="/services" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-stone-900 font-medium rounded-full border border-stone-300 hover:border-stone-400 hover:bg-stone-100/50 transition-all">
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
                A complete launch creative suite
              </h2>
              <p className="text-stone-600 text-lg mb-8">
                We produce everything you need to launch with impact—from hero visuals to social content to email designs.
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
                <p className="text-xs uppercase tracking-wider text-stone-400 mb-6">Package Details</p>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-stone-100">
                    <span className="text-stone-500">Typical Timeline</span>
                    <span className="font-medium text-stone-900">5-7 business days</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-stone-100">
                    <span className="text-stone-500">Ideal For</span>
                    <span className="font-medium text-stone-900">Product launches, brand refreshes</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-stone-500">Revisions</span>
                    <span className="font-medium text-stone-900">One round included</span>
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t border-stone-200">
                  <p className="text-stone-500 text-sm mb-4">Every project is custom-scoped to your needs.</p>
                  <motion.button onClick={openModal} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full px-6 py-3 bg-stone-900 text-white font-medium rounded-full hover:bg-stone-800 transition-colors">
                    Discuss Your Launch
                  </motion.button>
                </div>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-28 bg-background">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <FadeInSection className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-medium text-stone-900">Frequently asked questions</h2>
          </FadeInSection>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }} className="bg-white rounded-xl p-6 border border-stone-200">
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
            <h2 className="text-3xl md:text-4xl font-medium text-stone-900 mb-4">Ready to launch?</h2>
            <p className="text-stone-600 text-lg mb-8 max-w-2xl mx-auto">
              Let&apos;s discuss your launch timeline and create a custom package that fits your goals.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button onClick={openModal} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-flex items-center px-8 py-4 bg-stone-900 text-white font-medium rounded-full hover:bg-stone-800 transition-colors">
                Book a Call
              </motion.button>
              <motion.a href="/services" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-flex items-center px-8 py-4 bg-transparent text-stone-900 font-medium rounded-full border border-stone-400 hover:border-stone-500 hover:bg-white/50 transition-all">
                View All Services
              </motion.a>
            </div>
          </FadeInSection>
        </div>
      </section>
    </>
  )
}
