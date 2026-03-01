export interface SanityImage {
  _type: 'image'
  asset: {
    _ref: string
    _type: 'reference'
  }
  alt?: string
}

export interface SanityMedia {
  type: 'image' | 'video'
  image?: SanityImage
  videoUrl?: string
  videoPoster?: SanityImage
  autoplay?: boolean
  loop?: boolean
}

export interface HomepageData {
  hero: {
    headline: string
    subheadline: string
    primaryButtonText: string
    primaryButtonLink: string
    secondaryButtonText: string
    secondaryButtonLink: string
  }
  heroMedia?: SanityMedia
  services: {
    label: string
    headline: string
    description: string
    items: {
      title: string
      description: string
      deliverables: string[]
      media?: SanityMedia
    }[]
    buttonText: string
    buttonLink: string
  }
  socialProof: {
    label: string
    headline: string
    companies: {
      name: string
      logo?: SanityImage
      size?: 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge' | 'xxxlarge'
    }[]
    additionalText: string
  }
  localExpertise: {
    label: string
    headline: string
    description: string
    primaryButtonText: string
    primaryButtonLink: string
    secondaryButtonText: string
    secondaryButtonLink: string
    stats: {
      number: string
      label: string
    }[]
  }
  secondMedia?: SanityMedia
  cta: {
    headline: string
    description: string
    primaryButtonText: string
    primaryButtonLink: string
    secondaryButtonText: string
    secondaryButtonLink: string
  }
}

export interface AboutPageData {
  hero: {
    label: string
    headline: string
    description: string
  }
  founders: {
    name: string
    title: string
    bio: string
    companies: string[]
    media?: SanityMedia
  }[]
  story: {
    label: string
    headline: string
    paragraphs: string[]
    pullQuote: string
  }
  teamMedia?: SanityMedia
  cta: {
    headline: string
    description: string
    primaryButtonText: string
    primaryButtonLink: string
    secondaryButtonText: string
    secondaryButtonLink: string
  }
}

export interface ServicesPageData {
  hero: {
    label: string
    headline: string
    description: string
  }
  heroMedia?: SanityMedia
  packages: {
    name: string
    description: string
    deliverables: string[]
    timeline: string
    ideal: string
    media?: SanityMedia
  }[]
  process: {
    label: string
    headline: string
    description: string
    steps: {
      step: string
      title: string
      description: string
    }[]
  }
  cta: {
    headline: string
    description: string
    primaryButtonText: string
    primaryButtonLink: string
    secondaryButtonText: string
    secondaryButtonLink: string
  }
}

export interface SiteSettingsData {
  siteName: string
  siteDescription: string
  navigation: {
    label: string
    href: string
  }[]
  ctaButtonText: string
  ctaButtonLink: string
  footer: {
    headline: string
    description: string
    formHeadline: string
    socialLinks: {
      platform: 'linkedin' | 'twitter' | 'instagram' | 'facebook'
      url: string
    }[]
  }
}

// Blog Types
export interface Author {
  _id?: string
  name: string
  slug: { current: string }
  role?: string
  bio?: string
  credentials?: string[]
  linkedin?: string
  twitter?: string
  image?: SanityImage
}

export interface Category {
  _id?: string
  title: string
  slug: { current: string }
  description?: string
  color?: string
}

export interface PostSummary {
  _id: string
  title: string
  slug: { current: string }
  excerpt: string
  featuredImage?: SanityImage
  author?: Author
  categories?: Category[]
  contentType?: string
  publishedAt: string
  updatedAt?: string
  featured?: boolean
  readingTime?: number
}

// Portable Text block type
export interface PortableTextBlock {
  _type: string
  _key: string
  [key: string]: unknown
}

export interface Post extends PostSummary {
  body?: PortableTextBlock[]
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string[]
  canonicalUrl?: string
  relatedPosts?: PostSummary[]
}
