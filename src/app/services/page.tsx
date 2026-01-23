import type { Metadata } from 'next'
import Script from 'next/script'
import { clientNoCache } from '../../../sanity/lib/client'
import { servicesPageQuery } from '../../../sanity/lib/queries'
import type { ServicesPageData } from '../../../sanity/lib/types'
import ServicesPageClient from './ServicesPageClient'

const baseUrl = 'https://vaelcreative.com'

export const metadata: Metadata = {
  title: 'Services & Pricing | Vael Creative - AI-Accelerated Brand Content',
  description: 'Explore Vael Creative service packages: Brand Foundation, Growth Engine, and Scale Suite. AI-accelerated, human-curated content for consumer brands. Images, ads, video, and copy delivered fast.',
  keywords: ['creative services', 'brand content packages', 'AI content creation', 'marketing creative', 'ad creative services', 'video production', 'brand photography'],
  openGraph: {
    title: 'Services & Pricing | Vael Creative',
    description: 'AI-accelerated, human-curated creative packages for consumer brands. Choose from Brand Foundation, Growth Engine, or Scale Suite.',
    type: 'website',
    url: 'https://vaelcreative.com/services',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@vaelcreative',
    creator: '@vaelcreative',
    title: 'Services & Pricing | Vael Creative',
    description: 'AI-accelerated, human-curated creative packages for consumer brands.',
  },
}

// Revalidate this page every 60 seconds
export const revalidate = 60

// Default content as fallback
const defaultContent: ServicesPageData = {
  hero: {
    label: 'Our Services',
    headline: 'Creative packages that scale',
    description: 'Choose a package that fits your needs, or let us customize one for your specific requirements. Every deliverable is AI-accelerated and human-curated.',
  },
  heroMedia: undefined,
  packages: [
    {
      name: 'Launch Campaign Package',
      description: 'Everything you need to make a splash with your next product launch. From hero imagery to launch videos, we create a cohesive creative suite that captures attention and drives action.',
      deliverables: [
        'Hero images & product photography (10+ variations)',
        'Launch video (30s + 60s cuts)',
        'Social media content suite (20+ assets)',
        'Launch copy & messaging framework',
        'Email announcement designs (3 templates)',
      ],
      timeline: '5-7 business days',
      ideal: 'Product launches, brand refreshes',
    },
    {
      name: 'Seasonal Refresh',
      description: 'Keep your brand fresh and relevant with seasonally-appropriate creative that maintains brand consistency while capturing the moment.',
      deliverables: [
        'Seasonal campaign hero imagery (5+ variations)',
        'Updated lifestyle photography suite',
        'Social content calendar assets (15+ posts)',
        'Seasonal ad creative variations (10+ sizes)',
        'Email template designs (2 templates)',
      ],
      timeline: '3-5 business days',
      ideal: 'Holiday campaigns, quarterly refreshes',
    },
    {
      name: 'Paid Media Assets',
      description: 'Performance-optimized creative built for your paid acquisition channels. Every asset is designed to stop the scroll and drive conversions.',
      deliverables: [
        'Static ad variations (15+ assets, multiple sizes)',
        'Video ads (15s, 30s, 60s formats)',
        'UGC-style content (5+ pieces)',
        'A/B test creative variants',
        'Platform-specific optimizations',
      ],
      timeline: '4-6 business days',
      ideal: 'Performance marketing, growth campaigns',
    },
    {
      name: 'Brand Storytelling Content',
      description: 'Authentic content that connects your brand with your audience on a deeper level. Tell your story in a way that resonates.',
      deliverables: [
        'Brand documentary-style video (2-3 min)',
        'Founder/team photography session',
        'Behind-the-scenes content package',
        'Long-form brand copy & narratives',
        'Social storytelling assets (10+ pieces)',
      ],
      timeline: '7-10 business days',
      ideal: 'Brand building, PR campaigns',
    },
  ],
  process: {
    label: 'Our Process',
    headline: 'How We Work',
    description: 'A streamlined process designed for speed without sacrificing quality.',
    steps: [
      {
        step: '01',
        title: 'Discovery',
        description: 'We dive deep into your brand—guidelines, voice, existing assets, and goals.',
      },
      {
        step: '02',
        title: 'Strategy',
        description: 'We recommend the right package and align on creative direction and timelines.',
      },
      {
        step: '03',
        title: 'Creation',
        description: 'We use cutting-edge technology and proven taste to curate and perfect every piece.',
      },
      {
        step: '04',
        title: 'Delivery',
        description: 'You receive polished, ready-to-use assets with one round of revisions included.',
      },
    ],
  },
  cta: {
    headline: 'Need something custom?',
    description: "Every brand is unique. Let's build a custom package tailored to your specific needs, timeline, and budget.",
    primaryButtonText: 'Book Discovery Call',
    primaryButtonLink: '#calendly',
    secondaryButtonText: 'Learn About Us',
    secondaryButtonLink: '/about',
  },
}

async function getServicesPageData(): Promise<ServicesPageData> {
  try {
    const data = await clientNoCache.fetch(servicesPageQuery)
    if (data) {
      return {
        ...defaultContent,
        ...data,
        hero: { ...defaultContent.hero, ...data?.hero },
        process: {
          ...defaultContent.process,
          ...data?.process,
          steps: defaultContent.process.steps,
        },
        cta: { ...defaultContent.cta, ...data?.cta },
        packages: data?.packages?.length > 0 ? data.packages : defaultContent.packages,
      }
    }
    return defaultContent
  } catch (error) {
    console.error('Error fetching services page data:', error)
    return defaultContent
  }
}

// JSON-LD schemas for services page
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
  ],
}

const serviceSchemas = [
  {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${baseUrl}/services#launch-campaign`,
    name: 'Launch Campaign Package',
    description: 'Everything you need to make a splash with your next product launch. Hero imagery, launch videos, social media content, and messaging framework.',
    provider: {
      '@type': 'Organization',
      name: 'Vael Creative',
      url: baseUrl,
    },
    serviceType: 'Brand Content Creation',
    areaServed: 'United States',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Launch Campaign Deliverables',
      itemListElement: [
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Hero images & product photography' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Launch video production' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Social media content suite' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Launch copy & messaging framework' } },
      ],
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${baseUrl}/services#seasonal-refresh`,
    name: 'Seasonal Refresh Package',
    description: 'Keep your brand fresh with seasonally-appropriate creative that maintains brand consistency while capturing the moment.',
    provider: {
      '@type': 'Organization',
      name: 'Vael Creative',
      url: baseUrl,
    },
    serviceType: 'Brand Content Creation',
    areaServed: 'United States',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${baseUrl}/services#paid-media`,
    name: 'Paid Media Assets Package',
    description: 'Performance-optimized creative built for paid acquisition channels. Static ads, video ads, UGC-style content, and A/B test variants.',
    provider: {
      '@type': 'Organization',
      name: 'Vael Creative',
      url: baseUrl,
    },
    serviceType: 'Ad Creative Production',
    areaServed: 'United States',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${baseUrl}/services#brand-storytelling`,
    name: 'Brand Storytelling Content Package',
    description: 'Authentic content that connects your brand with your audience through documentary-style video, photography, and narratives.',
    provider: {
      '@type': 'Organization',
      name: 'Vael Creative',
      url: baseUrl,
    },
    serviceType: 'Video Production',
    areaServed: 'United States',
  },
]

export default async function ServicesPage() {
  const content = await getServicesPageData()

  return (
    <>
      <Script
        id="services-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {serviceSchemas.map((schema, index) => (
        <Script
          key={index}
          id={`service-schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <ServicesPageClient content={content} />
    </>
  )
}
