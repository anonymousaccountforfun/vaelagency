import { groq } from 'next-sanity'

// Media fragment for reuse
const mediaFragment = `{
  type,
  image {
    asset,
    alt
  },
  "videoUrl": coalesce(videoUrl, video.asset->url),
  videoPoster {
    asset
  },
  autoplay,
  loop
}`

export const homepageQuery = groq`*[_type == "homepage"][0]{
  hero,
  heroMedia ${mediaFragment},
  services {
    label,
    headline,
    description,
    items[] {
      title,
      description,
      deliverables,
      media ${mediaFragment}
    },
    buttonText,
    buttonLink
  },
  socialProof {
    label,
    headline,
    companies[] {
      name,
      logo {
        asset,
        alt
      },
      size
    },
    additionalText
  },
  localExpertise,
  secondMedia ${mediaFragment},
  cta
}`

export const aboutPageQuery = groq`*[_type == "aboutPage"][0]{
  hero,
  founders[] {
    name,
    title,
    bio,
    companies,
    media ${mediaFragment}
  },
  story,
  teamMedia ${mediaFragment},
  cta
}`

export const servicesPageQuery = groq`*[_type == "servicesPage"][0]{
  hero,
  heroMedia ${mediaFragment},
  packages[] {
    name,
    description,
    deliverables,
    timeline,
    ideal,
    media ${mediaFragment}
  },
  process,
  cta
}`

export const siteSettingsQuery = groq`*[_type == "siteSettings"][0]{
  siteName,
  siteDescription,
  navigation,
  ctaButtonText,
  ctaButtonLink,
  footer
}`
