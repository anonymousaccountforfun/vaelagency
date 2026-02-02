import type { Metadata } from 'next'
import Script from 'next/script'
import IndustryPageClient from '../IndustryPageClient'

const baseUrl = 'https://vaelcreative.com'

export const metadata: Metadata = {
  title: 'Creative Agency for DTC & Ecommerce Brands | Vael Creative',
  description: 'AI-accelerated creative production for DTC and ecommerce brands. Ad creative, product photography, video content, and brand assets built for growth-stage consumer brands.',
  keywords: [
    'DTC creative agency',
    'ecommerce creative agency',
    'DTC ad creative',
    'ecommerce brand content',
    'direct to consumer marketing',
    'DTC product photography',
    'ecommerce video production',
  ],
  openGraph: {
    title: 'Creative Agency for DTC & Ecommerce Brands | Vael Creative',
    description: 'AI-accelerated creative production for growth-stage DTC and ecommerce brands.',
    type: 'website',
    url: `${baseUrl}/industries/dtc-ecommerce`,
  },
  twitter: {
    card: 'summary_large_image',
    site: '@vaelcreative',
    title: 'Creative Agency for DTC & Ecommerce Brands',
    description: 'AI-accelerated creative for growth-stage DTC brands.',
  },
  alternates: {
    canonical: `${baseUrl}/industries/dtc-ecommerce`,
  },
}

const industrySchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${baseUrl}/industries/dtc-ecommerce`,
  name: 'Creative Services for DTC & Ecommerce Brands',
  description: 'AI-accelerated creative production for direct-to-consumer and ecommerce brands, including ad creative, product photography, video content, and brand assets.',
  provider: {
    '@type': 'Organization',
    name: 'Vael Creative',
    url: baseUrl,
  },
  serviceType: 'Creative Production for DTC Brands',
  areaServed: { '@type': 'Country', name: 'United States' },
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
    { '@type': 'ListItem', position: 2, name: 'Industries', item: `${baseUrl}/industries/dtc-ecommerce` },
    { '@type': 'ListItem', position: 3, name: 'DTC & Ecommerce', item: `${baseUrl}/industries/dtc-ecommerce` },
  ],
}

const content = {
  label: 'DTC & Ecommerce',
  headline: 'Creative for DTC & Ecommerce Brands',
  highlightWord: 'DTC',
  description: 'Growth-stage DTC brands need creative that converts. We produce ad creative, product content, and brand assets built for the pace and performance demands of direct-to-consumer.',
  challenges: [
    'Creative fatigue killing ad performance',
    'Need for constant testing and iteration',
    'Scaling content production without scaling headcount',
    'Maintaining brand consistency across channels',
  ],
  solutions: [
    'High-volume ad creative variations for testing',
    'Product photography and lifestyle content',
    'UGC-style video for social and paid',
    'Platform-optimized assets (Meta, TikTok, Google)',
  ],
  cta: 'Let\'s discuss how we can support your brand\'s growth with creative that performs.',
}

export default function DTCEcommercePage() {
  return (
    <>
      <Script id="industry-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(industrySchema) }} />
      <Script id="breadcrumb-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <IndustryPageClient content={content} />
    </>
  )
}
