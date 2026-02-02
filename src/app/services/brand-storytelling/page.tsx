import type { Metadata } from 'next'
import Script from 'next/script'
import BrandStorytellingPageClient from './BrandStorytellingPageClient'

const baseUrl = 'https://vaelcreative.com'

export const metadata: Metadata = {
  title: 'Brand Storytelling & Video Content | Vael Creative',
  description: 'Authentic brand content that connects with your audience. Documentary-style video, founder photography, behind-the-scenes content, and long-form brand narratives.',
  keywords: [
    'brand storytelling agency',
    'brand video production',
    'documentary brand video',
    'founder photography',
    'brand narrative',
    'behind the scenes content',
    'brand content agency',
  ],
  openGraph: {
    title: 'Brand Storytelling & Video Content | Vael Creative',
    description: 'Authentic content that connects your brand with your audience on a deeper level.',
    type: 'website',
    url: `${baseUrl}/services/brand-storytelling`,
  },
  twitter: {
    card: 'summary_large_image',
    site: '@vaelcreative',
    title: 'Brand Storytelling & Video Content',
    description: 'Authentic brand content that connects with your audience.',
  },
  alternates: {
    canonical: `${baseUrl}/services/brand-storytelling`,
  },
}

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${baseUrl}/services/brand-storytelling`,
  name: 'Brand Storytelling Content Package',
  description: 'Authentic content that connects your brand with your audience on a deeper level. Tell your story in a way that resonates.',
  provider: {
    '@type': 'Organization',
    name: 'Vael Creative',
    url: baseUrl,
  },
  serviceType: 'Video Production',
  areaServed: {
    '@type': 'Country',
    name: 'United States',
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Brand Storytelling Deliverables',
    itemListElement: [
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Brand documentary-style video (2-3 min)' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Founder/team photography session' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Behind-the-scenes content package' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Long-form brand copy & narratives' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Social storytelling assets (10+ pieces)' } },
    ],
  },
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
    { '@type': 'ListItem', position: 2, name: 'Services', item: `${baseUrl}/services` },
    { '@type': 'ListItem', position: 3, name: 'Brand Storytelling', item: `${baseUrl}/services/brand-storytelling` },
  ],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is included in the brand storytelling package?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Our brand storytelling package includes a documentary-style brand video (2-3 minutes), founder/team photography session, behind-the-scenes content package, long-form brand copy and narratives, and social storytelling assets (10+ pieces).',
      },
    },
    {
      '@type': 'Question',
      name: 'How long does brand storytelling content take to produce?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Brand storytelling packages are typically delivered within 7-10 business days. This allows time for discovery, production, and post-production to ensure we capture your brand authentically.',
      },
    },
  ],
}

export default function BrandStorytellingPage() {
  return (
    <>
      <Script id="service-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <Script id="breadcrumb-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <BrandStorytellingPageClient />
    </>
  )
}
