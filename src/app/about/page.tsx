import type { Metadata } from 'next'
import { clientNoCache } from '../../../sanity/lib/client'
import { aboutPageQuery } from '../../../sanity/lib/queries'
import type { AboutPageData } from '../../../sanity/lib/types'
import AboutPageClient from './AboutPageClient'

export const metadata: Metadata = {
  title: 'About Us | Vael Creative - Meet the Team Behind Premium Brand Content',
  description: 'Meet the founders of Vael Creative. Former leaders from Hims & Hers, Uber, Epidemic Sound, and more. We combine AI efficiency with human creativity to deliver premium content for consumer brands.',
  keywords: ['creative agency team', 'brand content experts', 'AI creative directors', 'NYC creative agency', 'consumer brand specialists'],
  openGraph: {
    title: 'About Us | Vael Creative',
    description: 'Meet the founders of Vael Creative - former leaders from Hims & Hers, Uber, and top music platforms.',
    type: 'website',
    url: 'https://vaelagency.vercel.app/about',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us | Vael Creative',
    description: 'Meet the founders of Vael Creative - former leaders from Hims & Hers, Uber, and top music platforms.',
  },
}

// Revalidate this page every 60 seconds
export const revalidate = 60

// Default content as fallback
const defaultContent: AboutPageData = {
  hero: {
    label: 'About Vael',
    headline: 'Meet the Team',
    description: "We're operators, strategists, and creatives who've built and scaled brands at the world's most innovative companies.",
  },
  founders: [
    {
      name: 'Brian Hughes',
      title: 'Co-Founder & CEO',
      bio: 'Former GM at Hims & Hers, where he led growth initiatives reaching millions of customers. Prior to that, Brian spent years at Uber driving strategic operations. He holds an MBA from Harvard Business School and is a graduate of West Point, bringing both strategic rigor and operational excellence to every client engagement.',
      companies: ['Hims & Hers', 'Uber', 'Harvard Business School', 'West Point'],
      media: undefined,
    },
    {
      name: 'Chris McDonald',
      title: 'Co-Founder & Chief Creative Officer',
      bio: "An accomplished audio engineer turned creative strategist, Chris has shaped the sound and vision of some of the world's most innovative music and media companies. His experience spans Epidemic Sound, Artlist, and UnitedMasters—giving him unique insight into how creative content scales while maintaining quality and authenticity.",
      companies: ['Epidemic Sound', 'Artlist', 'UnitedMasters'],
      media: undefined,
    },
  ],
  story: {
    label: 'Our Story',
    headline: 'Why we started Vael',
    paragraphs: [
      'After years of building and scaling consumer brands at companies like Uber, Hims & Hers, Spotify, and leading music platforms, we saw a consistent pain point: getting high-quality creative at the pace modern brands need.',
      "Traditional agencies are slow and expensive. Freelance marketplaces are inconsistent. In-house teams can't always keep up with demand. And while AI tools have exploded, they often produce generic, off-brand content that still requires significant human refinement.",
      'We founded Vael to bridge this gap. We combine the efficiency of AI with the taste and judgment of experienced creative directors. Every piece of content is generated using your brand assets, then curated by humans who understand what great looks like.',
    ],
    pullQuote: "Premium creative at startup speed—content that's on-brand, performance-ready, and delivered faster than you thought possible.",
  },
  teamMedia: undefined,
  cta: {
    headline: "Let's build something great together",
    description: "Ready to see how Vael can transform your creative workflow? Book a discovery call and let's explore what's possible.",
    primaryButtonText: 'Book Discovery Call',
    primaryButtonLink: '#calendly',
    secondaryButtonText: 'Explore Services',
    secondaryButtonLink: '/services',
  },
}

async function getAboutPageData(): Promise<AboutPageData> {
  try {
    const data = await clientNoCache.fetch(aboutPageQuery)
    if (data) {
      return {
        ...defaultContent,
        ...data,
        hero: { ...defaultContent.hero, ...data?.hero },
        story: { ...defaultContent.story, ...data?.story },
        cta: { ...defaultContent.cta, ...data?.cta },
        founders: data?.founders?.length > 0 ? data.founders : defaultContent.founders,
      }
    }
    return defaultContent
  } catch (error) {
    console.error('Error fetching about page data:', error)
    return defaultContent
  }
}

export default async function AboutPage() {
  const content = await getAboutPageData()

  // Pass founders with media directly
  const foundersWithMedia = content.founders.map((founder) => ({
    name: founder.name,
    title: founder.title,
    bio: founder.bio,
    companies: founder.companies,
    media: founder.media,
  }))

  return (
    <AboutPageClient
      content={content}
      foundersWithMedia={foundersWithMedia}
    />
  )
}
