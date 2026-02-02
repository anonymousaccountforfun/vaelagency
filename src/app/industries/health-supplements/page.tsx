import type { Metadata } from 'next'
import Script from 'next/script'
import IndustryPageClient from '../IndustryPageClient'

const baseUrl = 'https://vaelcreative.com'

export const metadata: Metadata = {
  title: 'Creative Agency for Health & Supplement Brands | Vael Creative',
  description: 'AI-accelerated creative production for health and supplement brands. Product photography, educational content, ad creative, and lifestyle imagery that builds trust.',
  keywords: [
    'supplement brand creative agency',
    'health brand marketing',
    'vitamin brand agency',
    'supplement ad creative',
    'health product photography',
    'nutraceutical marketing',
    'wellness supplement content',
  ],
  openGraph: {
    title: 'Creative Agency for Health & Supplement Brands | Vael Creative',
    description: 'AI-accelerated creative production for health and supplement brands.',
    type: 'website',
    url: `${baseUrl}/industries/health-supplements`,
  },
  twitter: {
    card: 'summary_large_image',
    site: '@vaelcreative',
    title: 'Creative Agency for Health & Supplement Brands',
    description: 'AI-accelerated creative for health and supplement brands.',
  },
  alternates: {
    canonical: `${baseUrl}/industries/health-supplements`,
  },
}

const industrySchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${baseUrl}/industries/health-supplements`,
  name: 'Creative Services for Health & Supplement Brands',
  description: 'AI-accelerated creative production for health and supplement brands, including product photography, educational content, ad creative, and lifestyle imagery.',
  provider: { '@type': 'Organization', name: 'Vael Creative', url: baseUrl },
  serviceType: 'Creative Production for Health Brands',
  areaServed: { '@type': 'Country', name: 'United States' },
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
    { '@type': 'ListItem', position: 2, name: 'Industries', item: `${baseUrl}/industries/health-supplements` },
    { '@type': 'ListItem', position: 3, name: 'Health & Supplements', item: `${baseUrl}/industries/health-supplements` },
  ],
}

const content = {
  label: 'Health & Supplements',
  headline: 'Creative for Health & Supplement Brands',
  highlightWord: 'Health',
  description: 'Health and supplement brands need creative that builds trust and communicates benefits clearly. We produce content that educates and converts.',
  challenges: [
    'Building credibility in a crowded market',
    'Communicating benefits without overclaiming',
    'Creating content that passes platform ad review',
    'Differentiating from competitors with similar products',
  ],
  solutions: [
    'Clean, premium product photography',
    'Lifestyle content showing real-world use',
    'Educational and benefit-focused ad creative',
    'UGC-style testimonial content',
  ],
  cta: 'Let\'s discuss how we can help your brand stand out and build trust.',
}

export default function HealthSupplementsPage() {
  return (
    <>
      <Script id="industry-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(industrySchema) }} />
      <Script id="breadcrumb-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <IndustryPageClient content={content} />
    </>
  )
}
