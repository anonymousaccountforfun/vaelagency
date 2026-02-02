import type { Metadata } from 'next'
import Script from 'next/script'
import LaunchCampaignsPageClient from './LaunchCampaignsPageClient'

const baseUrl = 'https://vaelcreative.com'

export const metadata: Metadata = {
  title: 'Launch Campaign Creative | Product Launch Agency | Vael Creative',
  description: 'Everything you need for your next product launch. Hero imagery, launch videos, social content, and messaging framework. AI-accelerated creative for consumer brands.',
  keywords: [
    'product launch creative agency',
    'launch campaign creative',
    'product launch marketing',
    'brand launch agency',
    'launch video production',
    'product photography',
    'DTC product launch',
  ],
  openGraph: {
    title: 'Launch Campaign Creative | Vael Creative',
    description: 'Complete creative suite for product launches. Hero imagery, videos, social content, and messaging.',
    type: 'website',
    url: `${baseUrl}/services/launch-campaigns`,
  },
  twitter: {
    card: 'summary_large_image',
    site: '@vaelcreative',
    title: 'Launch Campaign Creative',
    description: 'Complete creative suite for product launches.',
  },
  alternates: {
    canonical: `${baseUrl}/services/launch-campaigns`,
  },
}

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${baseUrl}/services/launch-campaigns`,
  name: 'Launch Campaign Creative Package',
  description: 'Everything you need to make a splash with your next product launch. From hero imagery to launch videos, we create a cohesive creative suite that captures attention and drives action.',
  provider: {
    '@type': 'Organization',
    name: 'Vael Creative',
    url: baseUrl,
  },
  serviceType: 'Brand Content Creation',
  areaServed: {
    '@type': 'Country',
    name: 'United States',
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Launch Campaign Deliverables',
    itemListElement: [
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Hero images & product photography (10+ variations)' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Launch video (30s + 60s cuts)' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Social media content suite (20+ assets)' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Launch copy & messaging framework' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Email announcement designs (3 templates)' } },
    ],
  },
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
    { '@type': 'ListItem', position: 2, name: 'Services', item: `${baseUrl}/services` },
    { '@type': 'ListItem', position: 3, name: 'Launch Campaigns', item: `${baseUrl}/services/launch-campaigns` },
  ],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is included in a launch campaign package?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Our launch campaign package includes hero images and product photography (10+ variations), launch videos in 30s and 60s cuts, a social media content suite (20+ assets), launch copy and messaging framework, and email announcement designs (3 templates).',
      },
    },
    {
      '@type': 'Question',
      name: 'How long does it take to produce launch campaign creative?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Launch campaign packages are typically delivered within 5-7 business days. We work with you to determine the right timeline based on your launch date.',
      },
    },
  ],
}

export default function LaunchCampaignsPage() {
  return (
    <>
      <Script id="service-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <Script id="breadcrumb-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <LaunchCampaignsPageClient />
    </>
  )
}
