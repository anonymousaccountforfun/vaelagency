import { client, urlFor } from '../../../sanity/lib/client'
import { aboutPageQuery } from '../../../sanity/lib/queries'
import type { AboutPageData } from '../../../sanity/lib/types'
import AboutPageClient from './AboutPageClient'

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
      image: null as any,
    },
    {
      name: 'Chris McDonald',
      title: 'Co-Founder & Chief Creative Officer',
      bio: "An accomplished audio engineer turned creative strategist, Chris has shaped the sound and vision of some of the world's most innovative music and media companies. His experience spans Epidemic Sound, Artlist, and UnitedMasters—giving him unique insight into how creative content scales while maintaining quality and authenticity.",
      companies: ['Epidemic Sound', 'Artlist', 'UnitedMasters'],
      image: null as any,
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
  teamImage: null as any,
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
    const data = await client.fetch(aboutPageQuery)
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

  // Process images
  const teamImageUrl = content.teamImage
    ? urlFor(content.teamImage).width(2070).quality(80).url()
    : 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'

  const foundersWithImages = content.founders.map((founder) => ({
    ...founder,
    imageUrl: founder.image
      ? urlFor(founder.image).width(800).quality(80).url()
      : founder.name === 'Brian Hughes'
        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  }))

  return (
    <AboutPageClient
      content={content}
      teamImageUrl={teamImageUrl}
      foundersWithImages={foundersWithImages}
    />
  )
}
