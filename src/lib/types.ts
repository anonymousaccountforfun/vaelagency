export interface MediaObject {
  type: 'image' | 'video'
  image?: {
    url?: string
    alt?: string
  }
  videoUrl?: string
  videoPoster?: {
    url?: string
  }
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
  heroMedia?: MediaObject
  services: {
    label: string
    headline: string
    description: string
    items: {
      title: string
      description: string
      deliverables: string[]
      media?: MediaObject
    }[]
    buttonText: string
    buttonLink: string
  }
  socialProof: {
    label: string
    headline: string
    companies: {
      name: string
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
  secondMedia?: MediaObject
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
    media?: MediaObject
  }[]
  story: {
    label: string
    headline: string
    paragraphs: string[]
    pullQuote: string
  }
  teamMedia?: MediaObject
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
  heroMedia?: MediaObject
  packages: {
    name: string
    description: string
    deliverables: string[]
    timeline: string
    ideal: string
    media?: MediaObject
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
