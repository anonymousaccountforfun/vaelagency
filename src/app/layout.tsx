import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import { GoogleAnalytics } from '@next/third-parties/google'
import './globals.css'
import LayoutWrapper from '@/components/LayoutWrapper'

// Optimized font loading - self-hosted, non-blocking
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700'],
})

const baseUrl = 'https://vaelcreative.com'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  icons: {
    icon: '/favicon.ico',
  },
  title: {
    default: 'Vael Creative | AI Marketing Agency for Hotels, Hospitality & Fashion',
    template: '%s | Vael Creative',
  },
  description: 'Boutique AI marketing agency for hotels, hospitality brands, fashion labels, and boutiques. Premium brand content, photography, and marketing with rapid turnaround.',
  keywords: ['AI marketing agency', 'hotel marketing', 'hospitality marketing', 'fashion marketing', 'boutique marketing', 'hotel photography', 'AI creative agency', 'property marketing', 'luxury brand content'],
  authors: [{ name: 'Vael Creative' }],
  creator: 'Vael Creative',
  publisher: 'Vael Creative',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Vael Creative | AI Marketing Agency for Hotels, Hospitality & Fashion',
    description: 'Boutique AI marketing agency for hotels, hospitality brands, fashion labels, and boutiques.',
    url: baseUrl,
    siteName: 'Vael Creative',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@vaelcreative',
    creator: '@vaelcreative',
    title: 'Vael Creative | AI Marketing Agency for Hotels, Hospitality & Fashion',
    description: 'Boutique AI marketing agency for hotels, hospitality brands, fashion labels, and boutiques.',
  },
  alternates: {
    canonical: baseUrl,
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
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Vael Creative',
  description: 'Boutique AI marketing agency for hotels, hospitality brands, fashion labels, and boutiques. Premium brand content with rapid turnaround.',
  url: baseUrl,
  logo: `${baseUrl}/images/vael-creative-logo.png`,
  foundingDate: '2025',
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
    'Hotel Marketing',
    'Hospitality Marketing',
    'Fashion Brand Marketing',
    'Boutique Marketing',
    'AI Content Creation',
    'Property Photography',
    'Social Media Marketing',
  ],
  knowsAbout: [
    'Hotel Marketing',
    'Hospitality Branding',
    'Fashion Brand Photography',
    'Property Marketing',
    'AI Image Generation',
    'Social Media Content',
    'Luxury Brand Strategy',
    'Boutique Marketing',
  ],
}

// JSON-LD structured data for FAQ (rich snippets)
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is AI-accelerated creative?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'AI-accelerated creative combines the efficiency of AI tools with human creative direction. We use AI to speed up production of marketing content for hotels, hospitality brands, and fashion labels while our creative directors ensure every piece is on-brand, high-quality, and performance-ready.',
      },
    },
    {
      '@type': 'Question',
      name: 'How fast can you deliver creative content?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Our turnaround times vary by package: Launch Campaigns deliver in 2-3 weeks, Seasonal Refreshes in 1-2 weeks, and Paid Media packages on an ongoing monthly basis. We move faster than traditional agencies while maintaining premium quality.',
      },
    },
    {
      '@type': 'Question',
      name: 'What types of creative content do you produce?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We produce a full range of brand content including ad creative, brand photography, video production, social media content, and marketing copy. All content is created using your existing brand assets to ensure consistency.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you work with brands outside of New York?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! While we are based in New York and have deep expertise with NYC hospitality and fashion brands, we work with hotels, resorts, and fashion labels nationwide. Our AI-accelerated workflow allows us to collaborate effectively with clients anywhere in the United States.',
      },
    },
  ],
}

// JSON-LD structured data for LocalBusiness (enhanced local SEO)
const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': `${baseUrl}/#localbusiness`,
  name: 'Vael Creative',
  description: 'Boutique AI marketing agency for hotels, hospitality brands, fashion labels, and boutiques in New York and nationwide.',
  url: baseUrl,
  logo: `${baseUrl}/images/vael-creative-logo.png`,
  image: `${baseUrl}/opengraph-image`,
  priceRange: '$$$$',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'New York',
    addressRegion: 'NY',
    postalCode: '10001',
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 40.7128,
    longitude: -74.0060,
  },
  areaServed: [
    {
      '@type': 'City',
      name: 'New York',
    },
    {
      '@type': 'Country',
      name: 'United States',
    },
  ],
  serviceType: [
    'Hotel Marketing',
    'Hospitality Marketing',
    'Fashion Brand Marketing',
    'Boutique Marketing',
    'AI Content Creation',
    'Property Photography',
    'Social Media Marketing',
  ],
  knowsAbout: [
    'Hotel Marketing',
    'Hospitality Branding',
    'Fashion Brand Photography',
    'Property Marketing',
    'AI Image Generation',
    'Social Media Content',
    'Luxury Brand Strategy',
    'Boutique Marketing',
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Preconnect to Sanity CDN for faster image/video loading */}
        <link rel="preconnect" href="https://cdn.sanity.io" />
        <link rel="dns-prefetch" href="https://cdn.sanity.io" />
        <link rel="dns-prefetch" href="https://www.youtube.com" />
        <link rel="dns-prefetch" href="https://player.vimeo.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </head>
      <body className="bg-background text-foreground antialiased min-h-screen" suppressHydrationWarning>
        <LayoutWrapper>{children}</LayoutWrapper>
        <Script
          src="/vael-chat.js"
          strategy="afterInteractive"
        />
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
      </body>
    </html>
  )
}
