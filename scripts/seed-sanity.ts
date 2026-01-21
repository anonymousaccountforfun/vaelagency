/**
 * Seed script to populate Sanity with existing website content
 * Run with: npx tsx scripts/seed-sanity.ts
 */

import { config } from 'dotenv'
import { createClient } from '@sanity/client'

// Load environment variables from .env.local
config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'smsxhytc',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN, // Required for write operations
})

// Homepage content
const homepageDocument = {
  _type: 'homepage',
  _id: 'homepage',
  hero: {
    headline: 'Premium creative\nfor consumer brands.',
    subheadline: "Human-curated, AI-accelerated content that's on-brand and performance-ready. Serving New York's boldest consumer brands.",
    primaryButtonText: 'Book Discovery Call',
    primaryButtonLink: '#calendly',
    secondaryButtonText: 'View Services',
    secondaryButtonLink: '/services',
  },
  services: {
    label: 'What We Do',
    headline: 'Creative packages built for growth',
    description: 'Choose the package that fits your needs, or let us customize one for you.',
    items: [
      {
        _key: 'launch',
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
        _key: 'seasonal',
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
        _key: 'paid',
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
        _key: 'storytelling',
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
      { _key: 'uber', name: 'Uber' },
      { _key: 'spotify', name: 'Spotify' },
      { _key: 'hims', name: 'Hims & Hers' },
      { _key: 'epidemic', name: 'Epidemic Sound' },
      { _key: 'artlist', name: 'Artlist' },
      { _key: 'united', name: 'UnitedMasters' },
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
      { _key: 'experience', number: '10+', label: 'Years Combined Experience' },
      { _key: 'users', number: '50M+', label: 'Users Reached' },
      { _key: 'turnaround', number: '48hr', label: 'Avg. Turnaround' },
      { _key: 'curation', number: '100%', label: 'Human Curation' },
    ],
  },
  cta: {
    headline: 'Ready to accelerate your creative?',
    description: "Join New York's most ambitious consumer brands using AI-powered creative that doesn't sacrifice quality.",
    primaryButtonText: 'Book Discovery Call',
    primaryButtonLink: '#calendly',
    secondaryButtonText: 'View Packages',
    secondaryButtonLink: '/services',
  },
}

// About page content
const aboutPageDocument = {
  _type: 'aboutPage',
  _id: 'aboutPage',
  hero: {
    label: 'About Vael',
    headline: 'Meet the Team',
    description: "We're operators, strategists, and creatives who've built and scaled brands at the world's most innovative companies.",
  },
  founders: [
    {
      _key: 'brian',
      name: 'Brian Hughes',
      title: 'Co-Founder & CEO',
      bio: 'Former GM at Hims & Hers, where he led growth initiatives reaching millions of customers. Prior to that, Brian spent years at Uber driving strategic operations. He holds an MBA from Harvard Business School and is a graduate of West Point, bringing both strategic rigor and operational excellence to every client engagement.',
      companies: ['Hims & Hers', 'Uber', 'Harvard Business School', 'West Point'],
    },
    {
      _key: 'chris',
      name: 'Chris McDonald',
      title: 'Co-Founder & Chief Creative Officer',
      bio: "An accomplished audio engineer turned creative strategist, Chris has shaped the sound and vision of some of the world's most innovative music and media companies. His experience spans Epidemic Sound, Artlist, and UnitedMasters—giving him unique insight into how creative content scales while maintaining quality and authenticity.",
      companies: ['Epidemic Sound', 'Artlist', 'UnitedMasters'],
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
  cta: {
    headline: "Let's build something great together",
    description: "Ready to see how Vael can transform your creative workflow? Book a discovery call and let's explore what's possible.",
    primaryButtonText: 'Book Discovery Call',
    primaryButtonLink: '#calendly',
    secondaryButtonText: 'Explore Services',
    secondaryButtonLink: '/services',
  },
}

// Services page content
const servicesPageDocument = {
  _type: 'servicesPage',
  _id: 'servicesPage',
  hero: {
    label: 'Our Services',
    headline: 'Creative packages that scale',
    description: 'Choose a package that fits your needs, or let us customize one for your specific requirements. Every deliverable is AI-accelerated and human-curated.',
  },
  packages: [
    {
      _key: 'launch',
      name: 'Launch Campaign Package',
      description: 'Everything you need to make a splash with your next product launch. From hero imagery to launch videos, we create a cohesive creative suite that captures attention and drives action.',
      deliverables: [
        'Hero images & product photography (10+ variations)',
        'Launch video (30s + 60s cuts)',
        'Social media content suite (20+ assets)',
        'Launch copy & messaging framework',
        'Email announcement designs (3 templates)',
      ],
      timeline: '5-7 business days',
      ideal: 'Product launches, brand refreshes',
    },
    {
      _key: 'seasonal',
      name: 'Seasonal Refresh',
      description: 'Keep your brand fresh and relevant with seasonally-appropriate creative that maintains brand consistency while capturing the moment.',
      deliverables: [
        'Seasonal campaign hero imagery (5+ variations)',
        'Updated lifestyle photography suite',
        'Social content calendar assets (15+ posts)',
        'Seasonal ad creative variations (10+ sizes)',
        'Email template designs (2 templates)',
      ],
      timeline: '3-5 business days',
      ideal: 'Holiday campaigns, quarterly refreshes',
    },
    {
      _key: 'paid',
      name: 'Paid Media Assets',
      description: 'Performance-optimized creative built for your paid acquisition channels. Every asset is designed to stop the scroll and drive conversions.',
      deliverables: [
        'Static ad variations (15+ assets, multiple sizes)',
        'Video ads (15s, 30s, 60s formats)',
        'UGC-style content (5+ pieces)',
        'A/B test creative variants',
        'Platform-specific optimizations',
      ],
      timeline: '4-6 business days',
      ideal: 'Performance marketing, growth campaigns',
    },
    {
      _key: 'storytelling',
      name: 'Brand Storytelling Content',
      description: 'Authentic content that connects your brand with your audience on a deeper level. Tell your story in a way that resonates.',
      deliverables: [
        'Brand documentary-style video (2-3 min)',
        'Founder/team photography session',
        'Behind-the-scenes content package',
        'Long-form brand copy & narratives',
        'Social storytelling assets (10+ pieces)',
      ],
      timeline: '7-10 business days',
      ideal: 'Brand building, PR campaigns',
    },
  ],
  process: {
    label: 'Our Process',
    headline: 'How We Work',
    description: 'A streamlined process designed for speed without sacrificing quality.',
    steps: [
      {
        _key: 'discovery',
        step: '01',
        title: 'Discovery',
        description: 'We dive deep into your brand—guidelines, voice, existing assets, and goals.',
      },
      {
        _key: 'strategy',
        step: '02',
        title: 'Strategy',
        description: 'We recommend the right package and align on creative direction and timelines.',
      },
      {
        _key: 'creation',
        step: '03',
        title: 'Creation',
        description: 'AI generates concepts using your assets. Human directors curate and perfect every piece.',
      },
      {
        _key: 'delivery',
        step: '04',
        title: 'Delivery',
        description: 'You receive polished, ready-to-use assets with one round of revisions included.',
      },
    ],
  },
  cta: {
    headline: 'Need something custom?',
    description: "Every brand is unique. Let's build a custom package tailored to your specific needs, timeline, and budget.",
    primaryButtonText: 'Book Discovery Call',
    primaryButtonLink: '#calendly',
    secondaryButtonText: 'Learn About Us',
    secondaryButtonLink: '/about',
  },
}

// Site settings content
const siteSettingsDocument = {
  _type: 'siteSettings',
  _id: 'siteSettings',
  siteName: 'Vael Agency',
  siteDescription: 'Premium creative for consumer brands',
  contact: {
    email: 'hello@vaelagency.com',
    phone: '',
    address: 'New York, NY',
  },
  social: {
    twitter: '',
    linkedin: '',
    instagram: '',
  },
  footer: {
    tagline: 'Premium creative for consumer brands',
    copyrightText: '© 2024 Vael Agency. All rights reserved.',
  },
}

async function seed() {
  console.log('🌱 Starting Sanity content seed...\n')

  if (!process.env.SANITY_API_TOKEN) {
    console.error('❌ Error: SANITY_API_TOKEN environment variable is required')
    console.log('\nTo get a token:')
    console.log('1. Go to https://www.sanity.io/manage')
    console.log('2. Select your project (smsxhytc)')
    console.log('3. Go to API → Tokens')
    console.log('4. Create a new token with "Editor" permissions')
    console.log('5. Add to .env.local: SANITY_API_TOKEN=your_token_here')
    console.log('\nThen run: SANITY_API_TOKEN=your_token npx tsx scripts/seed-sanity.ts')
    process.exit(1)
  }

  try {
    // Create or replace homepage
    console.log('📄 Creating Homepage document...')
    await client.createOrReplace(homepageDocument)
    console.log('   ✓ Homepage created')

    // Create or replace about page
    console.log('📄 Creating About Page document...')
    await client.createOrReplace(aboutPageDocument)
    console.log('   ✓ About Page created')

    // Create or replace services page
    console.log('📄 Creating Services Page document...')
    await client.createOrReplace(servicesPageDocument)
    console.log('   ✓ Services Page created')

    // Create or replace site settings
    console.log('📄 Creating Site Settings document...')
    await client.createOrReplace(siteSettingsDocument)
    console.log('   ✓ Site Settings created')

    console.log('\n✅ Seed completed successfully!')
    console.log('\nYour content is now available in Sanity Studio.')
    console.log('Visit http://localhost:3001/studio to edit your content.')
  } catch (error) {
    console.error('\n❌ Error seeding content:', error)
    process.exit(1)
  }
}

seed()
