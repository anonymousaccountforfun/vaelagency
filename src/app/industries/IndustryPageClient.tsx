'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { FadeInSection } from '@/components/AnimatedSection'
import { useContactModal } from '@/components/ContactModalContext'

interface IndustryContent {
  label: string
  headline: string
  highlightWord: string
  description: string
  challenges: string[]
  solutions: string[]
  cta: string
}

interface IndustryPageClientProps {
  content: IndustryContent
}

function highlightWord(text: string, word: string) {
  const parts = text.split(new RegExp(`(${word})`, 'gi'))
  return parts.map((part, i) =>
    part.toLowerCase() === word.toLowerCase()
      ? <span key={i} className="text-red-500">{part}</span>
      : part
  )
}

export default function IndustryPageClient({ content }: IndustryPageClientProps) {
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
              <li className="text-stone-900">{content.label}</li>
            </ol>
          </motion.nav>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.6 }} className="text-stone-500 text-sm uppercase tracking-widest mb-6">
              Industries We Serve
            </motion.p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium text-stone-900 mb-6">
              {highlightWord(content.headline, content.highlightWord)}
            </h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }} className="text-lg md:text-xl text-stone-600 max-w-3xl mb-8">
              {content.description}
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

      {/* Challenges & Solutions */}
      <section className="py-20 md:py-28 bg-background-secondary">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Challenges */}
            <FadeInSection>
              <div className="bg-white rounded-2xl p-8 border border-stone-200 h-full">
                <p className="text-xs uppercase tracking-wider text-stone-400 mb-6">Common Challenges</p>
                <h2 className="text-2xl font-medium text-stone-900 mb-6">What we hear from brands</h2>
                <ul className="space-y-4">
                  {content.challenges.map((challenge, i) => (
                    <li key={i} className="flex items-start gap-3 text-stone-600">
                      <span className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-medium text-stone-500">{i + 1}</span>
                      </span>
                      {challenge}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeInSection>

            {/* Solutions */}
            <FadeInSection delay={0.2}>
              <div className="bg-white rounded-2xl p-8 border border-stone-200 h-full">
                <p className="text-xs uppercase tracking-wider text-stone-400 mb-6">How We Help</p>
                <h2 className="text-2xl font-medium text-stone-900 mb-6">What we deliver</h2>
                <ul className="space-y-4">
                  {content.solutions.map((solution, i) => (
                    <li key={i} className="flex items-start gap-3 text-stone-700">
                      <svg className="w-5 h-5 mt-0.5 text-stone-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {solution}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* Services Link */}
      <section className="py-20 md:py-28 bg-background">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <FadeInSection className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-medium text-stone-900 mb-4">Our services</h2>
            <p className="text-stone-600 text-lg max-w-2xl mx-auto">
              Every project is custom-scoped to your needs. Here are the packages we typically work with.
            </p>
          </FadeInSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Paid Media Creative', href: '/services/paid-media-creative', description: 'Ad variations, video ads, UGC content' },
              { title: 'Launch Campaigns', href: '/services/launch-campaigns', description: 'Hero imagery, launch videos, social content' },
              { title: 'Seasonal Campaigns', href: '/services/seasonal-campaigns', description: 'Holiday and quarterly creative refreshes' },
              { title: 'Brand Storytelling', href: '/services/brand-storytelling', description: 'Documentary video, photography, narratives' },
            ].map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={service.href} className="block bg-white rounded-xl p-6 border border-stone-200 hover:border-stone-300 hover:shadow-sm transition-all h-full group">
                  <h3 className="font-medium text-stone-900 mb-2 group-hover:text-red-500 transition-colors">{service.title}</h3>
                  <p className="text-stone-500 text-sm">{service.description}</p>
                </Link>
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
              Ready to get started?
            </h2>
            <p className="text-stone-600 text-lg mb-8 max-w-2xl mx-auto">
              {content.cta}
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
