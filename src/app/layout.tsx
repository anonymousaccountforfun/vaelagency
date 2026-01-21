import type { Metadata } from 'next'
import './globals.css'
import LayoutWrapper from '@/components/LayoutWrapper'

export const metadata: Metadata = {
  title: 'Vael Agency | Premium Creative for Consumer Brands',
  description: 'Human-curated, AI-accelerated creative content. On-brand, performance-ready creative (images, ads, video, copy) using your asset library. Serving New York\'s boldest consumer brands.',
  keywords: ['creative agency', 'AI creative', 'consumer brands', 'New York', 'brand content', 'marketing'],
  openGraph: {
    title: 'Vael Agency | Premium Creative for Consumer Brands',
    description: 'Human-curated, AI-accelerated creative content for consumer brands.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased min-h-screen" suppressHydrationWarning>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  )
}
