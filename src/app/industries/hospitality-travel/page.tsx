import type { Metadata } from 'next'
import Script from 'next/script'
import IndustryPageClient from '../IndustryPageClient'

const baseUrl = 'https://vaelcreative.com'

export const metadata: Metadata = {
  title: 'Creative Agency for Hospitality & Travel Brands | Vael Creative',
  description: 'AI-accelerated creative production for hospitality and travel brands. Destination photography, property content, ad creative, and brand storytelling that inspires booking.',
  keywords: [
    'hospitality creative agency',
    'travel brand marketing',
    'hotel marketing agency',
    'destination content creation',
    'travel ad creative',
    'hospitality photography',
    'tourism brand agency',
  ],
  openGraph: {
    title: 'Creative Agency for Hospitality & Travel Brands | Vael Creative',
    description: 'AI-accelerated creative production for hospitality and travel brands.',
    type: 'website',
    url: `${baseUrl}/industries/hospitality-travel`,
  },
  twitter: {
    card: 'summary_large_image',
    site: '@vaelcreative',
    title: 'Creative Agency for Hospitality & Travel Brands',
    description: 'AI-accelerated creative for hospitality and travel brands.',
  },
  alternates: {
    canonical: `${baseUrl}/industries/hospitality-travel`,
  },
}

const industrySchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${baseUrl}/industries/hospitality-travel`,
  name: 'Creative Services for Hospitality & Travel Brands',
  description: 'AI-accelerated creative production for hospitality and travel brands, including destination photography, property content, ad creative, and brand storytelling.',
  provider: { '@type': 'Organization', name: 'Vael Creative', url: baseUrl },
  serviceType: 'Creative Production for Hospitality Brands',
  areaServed: { '@type': 'Country', name: 'United States' },
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
    { '@type': 'ListItem', position: 2, name: 'Industries', item: `${baseUrl}/industries/hospitality-travel` },
    { '@type': 'ListItem', position: 3, name: 'Hospitality & Travel', item: `${baseUrl}/industries/hospitality-travel` },
  ],
}

const content = {
  label: 'Hospitality & Travel',
  headline: 'Creative for Hospitality & Travel Brands',
  highlightWord: 'Travel',
  description: 'Hospitality and travel brands sell experiences. We produce content that captures the feeling of being there and inspires action.',
  challenges: [
    'Showcasing experiences, not just spaces',
    'Standing out in visually competitive markets',
    'Producing seasonal and promotional content quickly',
    'Maintaining consistency across properties or destinations',
  ],
  solutions: [
    'Property and destination photography',
    'Experience-focused lifestyle content',
    'Seasonal campaign and promotional creative',
    'Social content that captures atmosphere',
  ],
  cta: 'Let\'s discuss how we can help your brand inspire travelers.',
}

export default function HospitalityTravelPage() {
  return (
    <>
      <Script id="industry-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(industrySchema) }} />
      <Script id="breadcrumb-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <IndustryPageClient content={content} />
    </>
  )
}
