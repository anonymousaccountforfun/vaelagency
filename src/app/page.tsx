import { clientNoCache } from '../../sanity/lib/client'
import { homepageQuery } from '../../sanity/lib/queries'
import type { HomepageData } from '../../sanity/lib/types'
import HomePageClient from './HomePageClient'

// Revalidate this page every 60 seconds
export const revalidate = 60

// Default content as fallback
const defaultContent: HomepageData = {
  hero: {
    headline: 'Premium creative\nfor consumer brands.',
    subheadline: "Human-curated, AI-accelerated content that's on-brand and performance-ready. Serving New York's boldest consumer brands.",
    primaryButtonText: 'Book Discovery Call',
    primaryButtonLink: '#calendly',
    secondaryButtonText: 'View Services',
    secondaryButtonLink: '/services',
  },
  heroMedia: undefined,
  services: {
    label: 'What We Do',
    headline: 'Creative packages built for growth',
    description: 'Choose the package that fits your needs, or let us customize one for you.',
    items: [
      {
        title: 'Launch Campaign Package',
        description: 'Everything you need to make a splash with your next product launch.',
        deliverables: [
          'Hero images & product photography',
          'Launch video (30s + 60s cuts)',
          'Social media content suite',
          'Launch copy & messaging',
          'Email announcement designs',
        ],
      },
      {
        title: 'Seasonal Refresh',
        description: 'Keep your brand fresh with seasonally-relevant creative assets.',
        deliverables: [
          'Seasonal campaign imagery',
          'Updated lifestyle photography',
          'Social content calendar assets',
          'Seasonal ad creative variations',
          'Email template designs',
        ],
      },
      {
        title: 'Paid Media Assets',
        description: 'Performance-optimized creative for your paid acquisition channels.',
        deliverables: [
          'Static ad variations (multiple sizes)',
          'Video ads (15s, 30s formats)',
          'UGC-style content',
          'A/B test creative variants',
          'Platform-specific optimizations',
        ],
      },
      {
        title: 'Brand Storytelling Content',
        description: 'Authentic content that connects your brand with your audience.',
        deliverables: [
          'Brand documentary-style video',
          'Founder/team photography',
          'Behind-the-scenes content',
          'Long-form brand copy',
          'Social storytelling assets',
        ],
      },
    ],
    buttonText: 'Explore All Services',
    buttonLink: '/services',
  },
  socialProof: {
    label: 'Our Pedigree',
    headline: 'Founded by executives from',
    companies: [
      { name: 'Uber' },
      { name: 'Spotify' },
      { name: 'Hims & Hers' },
      { name: 'Epidemic Sound' },
      { name: 'Artlist' },
      { name: 'UnitedMasters' },
    ],
    additionalText: '+ Harvard Business School, West Point',
  },
  localExpertise: {
    label: 'Local Expertise',
    headline: "Serving New York's boldest consumer brands",
    description: "We understand the pace and ambition of New York's startup ecosystem. Our team brings Fortune 500 experience to emerging brands ready to scale.",
    primaryButtonText: 'Book Discovery Call',
    primaryButtonLink: '#calendly',
    secondaryButtonText: 'Meet the Team',
    secondaryButtonLink: '/about',
    stats: [
      { number: '10+', label: 'Years Combined Experience' },
      { number: '50M+', label: 'Users Reached' },
      { number: '48hr', label: 'Avg. Turnaround' },
      { number: '100%', label: 'Human Curation' },
    ],
  },
  secondMedia: undefined,
  cta: {
    headline: 'Ready to accelerate your creative?',
    description: "Join New York's most ambitious consumer brands using AI-powered creative that doesn't sacrifice quality.",
    primaryButtonText: 'Book Discovery Call',
    primaryButtonLink: '#calendly',
    secondaryButtonText: 'View Packages',
    secondaryButtonLink: '/services',
  },
}

async function getHomepageData(): Promise<HomepageData> {
  try {
    const data = await clientNoCache.fetch(homepageQuery)
    if (data) {
      return {
        ...defaultContent,
        ...data,
        hero: { ...defaultContent.hero, ...data?.hero },
        services: { ...defaultContent.services, ...data?.services },
        socialProof: { ...defaultContent.socialProof, ...data?.socialProof },
        localExpertise: { ...defaultContent.localExpertise, ...data?.localExpertise },
        cta: { ...defaultContent.cta, ...data?.cta },
      }
    }
    return defaultContent
  } catch (error) {
    console.error('Error fetching homepage data:', error)
    return defaultContent
  }
}

export default async function Home() {
  const content = await getHomepageData()

  return <HomePageClient content={content} />
}
