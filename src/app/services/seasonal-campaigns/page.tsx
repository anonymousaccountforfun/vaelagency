import type { Metadata } from 'next'
import Script from 'next/script'
import SeasonalCampaignsPageClient from './SeasonalCampaignsPageClient'

const baseUrl = 'https://vaelcreative.com'

export const metadata: Metadata = {
  title: 'Seasonal Campaign Creative | Holiday Marketing | Vael Creative',
  description: 'Keep your brand fresh with seasonally-appropriate creative. Seasonal imagery, lifestyle photography, social content, and ad creative variations for holiday and quarterly campaigns.',
  keywords: [
    'seasonal marketing creative',
    'holiday campaign agency',
    'seasonal ad creative',
    'holiday marketing',
    'quarterly campaign creative',
    'seasonal brand refresh',
    'holiday ad creative',
  ],
  openGraph: {
    title: 'Seasonal Campaign Creative | Vael Creative',
    description: 'Seasonally-appropriate creative that maintains brand consistency while capturing the moment.',
    type: 'website',
    url: `${baseUrl}/services/seasonal-campaigns`,
  },
  twitter: {
    card: 'summary_large_image',
    site: '@vaelcreative',
    title: 'Seasonal Campaign Creative',
    description: 'Seasonally-appropriate creative for holiday and quarterly campaigns.',
  },
  alternates: {
    canonical: `${baseUrl}/services/seasonal-campaigns`,
  },
}

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${baseUrl}/services/seasonal-campaigns`,
  name: 'Seasonal Refresh Creative Package',
  description: 'Keep your brand fresh and relevant with seasonally-appropriate creative that maintains brand consistency while capturing the moment.',
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
    name: 'Seasonal Campaign Deliverables',
    itemListElement: [
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Seasonal campaign hero imagery (5+ variations)' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Updated lifestyle photography suite' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Social content calendar assets (15+ posts)' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Seasonal ad creative variations (10+ sizes)' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Email template designs (2 templates)' } },
    ],
  },
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
    { '@type': 'ListItem', position: 2, name: 'Services', item: `${baseUrl}/services` },
    { '@type': 'ListItem', position: 3, name: 'Seasonal Campaigns', item: `${baseUrl}/services/seasonal-campaigns` },
  ],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is included in a seasonal refresh package?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Our seasonal refresh package includes seasonal campaign hero imagery (5+ variations), updated lifestyle photography, social content calendar assets (15+ posts), seasonal ad creative variations (10+ sizes), and email template designs (2 templates).',
      },
    },
    {
      '@type': 'Question',
      name: 'How far in advance should we plan seasonal campaigns?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We recommend starting seasonal campaign planning 4-6 weeks before launch. Our typical turnaround for seasonal refresh packages is 3-5 business days once we begin production.',
      },
    },
  ],
}

export default function SeasonalCampaignsPage() {
  return (
    <>
      <Script id="service-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <Script id="breadcrumb-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <SeasonalCampaignsPageClient />
    </>
  )
}
