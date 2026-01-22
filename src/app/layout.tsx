import type { Metadata } from 'next'
import './globals.css'
import LayoutWrapper from '@/components/LayoutWrapper'

const baseUrl = 'https://vaelagency.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Vael Creative | Premium Creative for Consumer Brands',
    template: '%s | Vael Creative',
  },
  description: 'Human-curated, AI-accelerated creative content. On-brand, performance-ready creative (images, ads, video, copy) using your asset library. Serving New York\'s boldest consumer brands.',
  keywords: ['creative agency', 'AI creative', 'consumer brands', 'New York', 'brand content', 'marketing', 'ad creative', 'brand photography', 'video production'],
  authors: [{ name: 'Vael Creative' }],
  creator: 'Vael Creative',
  publisher: 'Vael Creative',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Vael Creative | Premium Creative for Consumer Brands',
    description: 'Human-curated, AI-accelerated creative content for consumer brands.',
    url: baseUrl,
    siteName: 'Vael Creative',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vael Creative | Premium Creative for Consumer Brands',
    description: 'Human-curated, AI-accelerated creative content for consumer brands.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

// JSON-LD structured data for Organization
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Vael Creative',
  description: 'Human-curated, AI-accelerated creative content for consumer brands.',
  url: baseUrl,
  logo: `${baseUrl}/images/vael-creative-logo.png`,
  foundingDate: '2024',
  founders: [
    {
      '@type': 'Person',
      name: 'Brian Hughes',
      jobTitle: 'Co-Founder & CEO',
    },
    {
      '@type': 'Person',
      name: 'Chris McDonald',
      jobTitle: 'Co-Founder & Chief Creative Officer',
    },
  ],
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'New York',
    addressRegion: 'NY',
    addressCountry: 'US',
  },
  sameAs: [
    'https://www.linkedin.com/company/vaelcreative',
    'https://twitter.com/vaelcreative',
    'https://www.instagram.com/vaelcreative',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'sales',
    availableLanguage: 'English',
  },
  areaServed: {
    '@type': 'Place',
    name: 'United States',
  },
  serviceType: [
    'Brand Content Creation',
    'AI-Accelerated Creative',
    'Ad Creative Production',
    'Video Production',
    'Brand Photography',
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-background text-foreground antialiased min-h-screen" suppressHydrationWarning>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  )
}
