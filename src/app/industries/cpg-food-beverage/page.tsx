import type { Metadata } from 'next'
import Script from 'next/script'
import IndustryPageClient from '../IndustryPageClient'

const baseUrl = 'https://vaelcreative.com'

export const metadata: Metadata = {
  title: 'Creative Agency for CPG & Food Brands | Vael Creative',
  description: 'AI-accelerated creative production for CPG, food, and beverage brands. Product photography, packaging content, ad creative, and lifestyle imagery that drives purchase.',
  keywords: [
    'CPG creative agency',
    'food brand creative agency',
    'beverage brand marketing',
    'food photography agency',
    'CPG ad creative',
    'food and beverage content',
    'consumer packaged goods marketing',
  ],
  openGraph: {
    title: 'Creative Agency for CPG & Food Brands | Vael Creative',
    description: 'AI-accelerated creative production for CPG, food, and beverage brands.',
    type: 'website',
    url: `${baseUrl}/industries/cpg-food-beverage`,
  },
  twitter: {
    card: 'summary_large_image',
    site: '@vaelcreative',
    title: 'Creative Agency for CPG & Food Brands',
    description: 'AI-accelerated creative for CPG and food brands.',
  },
  alternates: {
    canonical: `${baseUrl}/industries/cpg-food-beverage`,
  },
}

const industrySchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${baseUrl}/industries/cpg-food-beverage`,
  name: 'Creative Services for CPG & Food Brands',
  description: 'AI-accelerated creative production for CPG, food, and beverage brands, including product photography, packaging content, ad creative, and lifestyle imagery.',
  provider: { '@type': 'Organization', name: 'Vael Creative', url: baseUrl },
  serviceType: 'Creative Production for CPG Brands',
  areaServed: { '@type': 'Country', name: 'United States' },
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
    { '@type': 'ListItem', position: 2, name: 'Industries', item: `${baseUrl}/industries/cpg-food-beverage` },
    { '@type': 'ListItem', position: 3, name: 'CPG & Food', item: `${baseUrl}/industries/cpg-food-beverage` },
  ],
}

const content = {
  label: 'CPG & Food',
  headline: 'Creative for CPG & Food Brands',
  highlightWord: 'Food',
  description: 'CPG and food brands need content that makes products irresistible. We produce product photography, lifestyle content, and ad creative that drives purchase intent.',
  challenges: [
    'Standing out in crowded retail and digital shelves',
    'Producing seasonal and promotional content quickly',
    'Showing product in appetizing, authentic contexts',
    'Scaling content across multiple SKUs',
  ],
  solutions: [
    'Product and packaging photography',
    'Lifestyle and recipe content',
    'Seasonal campaign creative',
    'Ad variations for retail and DTC channels',
  ],
  cta: 'Let\'s discuss how we can make your products impossible to scroll past.',
}

export default function CPGFoodBeveragePage() {
  return (
    <>
      <Script id="industry-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(industrySchema) }} />
      <Script id="breadcrumb-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <IndustryPageClient content={content} />
    </>
  )
}
