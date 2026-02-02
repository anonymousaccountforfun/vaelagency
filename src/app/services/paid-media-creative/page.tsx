import type { Metadata } from 'next'
import Script from 'next/script'
import PaidMediaPageClient from './PaidMediaPageClient'

const baseUrl = 'https://vaelcreative.com'

export const metadata: Metadata = {
  title: 'Paid Media Creative & Ad Assets | Vael Creative',
  description: 'Performance-optimized ad creative for Meta, TikTok, and Google. Static ads, video ads, UGC-style content, and A/B test variants. AI-accelerated, human-curated.',
  keywords: [
    'ad creative agency',
    'paid media creative',
    'performance creative agency',
    'Meta ad creative',
    'TikTok ad creative',
    'UGC ads',
    'ad creative production',
    'DTC ad creative',
  ],
  openGraph: {
    title: 'Paid Media Creative & Ad Assets | Vael Creative',
    description: 'Performance-optimized ad creative for paid acquisition channels. AI-accelerated, human-curated.',
    type: 'website',
    url: `${baseUrl}/services/paid-media-creative`,
  },
  twitter: {
    card: 'summary_large_image',
    site: '@vaelcreative',
    title: 'Paid Media Creative & Ad Assets',
    description: 'Performance-optimized ad creative for paid acquisition channels.',
  },
  alternates: {
    canonical: `${baseUrl}/services/paid-media-creative`,
  },
}

// Service schema
const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${baseUrl}/services/paid-media-creative`,
  name: 'Paid Media Creative & Ad Assets',
  description: 'Performance-optimized creative built for paid acquisition channels. Static ads, video ads, UGC-style content, and A/B test variants designed to stop the scroll and drive conversions.',
  provider: {
    '@type': 'Organization',
    name: 'Vael Creative',
    url: baseUrl,
  },
  serviceType: 'Ad Creative Production',
  areaServed: {
    '@type': 'Country',
    name: 'United States',
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Paid Media Creative Deliverables',
    itemListElement: [
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Static ad variations (15+ assets, multiple sizes)' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Video ads (15s, 30s, 60s formats)' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'UGC-style content' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'A/B test creative variants' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Platform-specific optimizations' } },
    ],
  },
}

// Breadcrumb schema
const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: baseUrl,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Services',
      item: `${baseUrl}/services`,
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'Paid Media Creative',
      item: `${baseUrl}/services/paid-media-creative`,
    },
  ],
}

// FAQ schema for common questions
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What ad formats do you produce?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We produce static ads in multiple sizes, video ads in 15s, 30s, and 60s formats, UGC-style content, and A/B test variants. All assets are optimized for Meta, TikTok, Google, and other paid channels.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does AI-accelerated ad creative work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We use AI tools to accelerate production while our creative directors ensure every piece is on-brand and performance-ready. This allows us to deliver more creative variations faster than traditional agencies.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the turnaround time for paid media assets?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Paid media asset packages are typically delivered within 4-6 business days, depending on scope. We work with you to determine the right timeline for your needs.',
      },
    },
  ],
}

export default function PaidMediaCreativePage() {
  return (
    <>
      <Script
        id="service-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <PaidMediaPageClient />
    </>
  )
}
