import type { Metadata } from 'next'
import Script from 'next/script'
import IndustryPageClient from '../IndustryPageClient'

const baseUrl = 'https://vaelcreative.com'

export const metadata: Metadata = {
  title: 'Creative Agency for Beauty & Wellness Brands | Vael Creative',
  description: 'AI-accelerated creative production for beauty and wellness brands. Product photography, lifestyle content, ad creative, and brand assets that capture your aesthetic.',
  keywords: [
    'beauty brand creative agency',
    'wellness brand agency',
    'beauty product photography',
    'skincare brand creative',
    'wellness marketing agency',
    'beauty ad creative',
    'cosmetics brand content',
  ],
  openGraph: {
    title: 'Creative Agency for Beauty & Wellness Brands | Vael Creative',
    description: 'AI-accelerated creative production for beauty and wellness brands.',
    type: 'website',
    url: `${baseUrl}/industries/beauty-wellness`,
  },
  twitter: {
    card: 'summary_large_image',
    site: '@vaelcreative',
    title: 'Creative Agency for Beauty & Wellness Brands',
    description: 'AI-accelerated creative for beauty and wellness brands.',
  },
  alternates: {
    canonical: `${baseUrl}/industries/beauty-wellness`,
  },
}

const industrySchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${baseUrl}/industries/beauty-wellness`,
  name: 'Creative Services for Beauty & Wellness Brands',
  description: 'AI-accelerated creative production for beauty and wellness brands, including product photography, lifestyle content, ad creative, and brand assets.',
  provider: { '@type': 'Organization', name: 'Vael Creative', url: baseUrl },
  serviceType: 'Creative Production for Beauty Brands',
  areaServed: { '@type': 'Country', name: 'United States' },
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
    { '@type': 'ListItem', position: 2, name: 'Industries', item: `${baseUrl}/industries/beauty-wellness` },
    { '@type': 'ListItem', position: 3, name: 'Beauty & Wellness', item: `${baseUrl}/industries/beauty-wellness` },
  ],
}

const content = {
  label: 'Beauty & Wellness',
  headline: 'Creative for Beauty & Wellness Brands',
  highlightWord: 'Beauty',
  description: 'Beauty and wellness brands live and die by their visual identity. We produce product photography, lifestyle content, and ad creative that captures your aesthetic and converts.',
  challenges: [
    'Maintaining a premium look across all touchpoints',
    'Producing enough content for social and paid channels',
    'Balancing aspiration with authenticity',
    'Keeping up with platform trends (TikTok, Reels)',
  ],
  solutions: [
    'Product photography that highlights textures and details',
    'Lifestyle and editorial content',
    'UGC-style video for social proof',
    'Platform-native ad creative for Meta and TikTok',
  ],
  cta: 'Let\'s discuss how we can elevate your brand\'s visual presence.',
}

export default function BeautyWellnessPage() {
  return (
    <>
      <Script id="industry-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(industrySchema) }} />
      <Script id="breadcrumb-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <IndustryPageClient content={content} />
    </>
  )
}
