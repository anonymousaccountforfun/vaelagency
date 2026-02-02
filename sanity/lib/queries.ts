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

// Blog queries
export const postsQuery = groq`*[_type == "post"] | order(publishedAt desc) {
  _id,
  title,
  slug,
  excerpt,
  featuredImage {
    asset,
    alt
  },
  author->{
    name,
    slug,
    role,
    image {
      asset,
      alt
    }
  },
  categories[]->{
    title,
    slug,
    color
  },
  contentType,
  publishedAt,
  updatedAt,
  featured,
  readingTime
}`

export const featuredPostsQuery = groq`*[_type == "post" && featured == true] | order(publishedAt desc) [0...3] {
  _id,
  title,
  slug,
  excerpt,
  featuredImage {
    asset,
    alt
  },
  author->{
    name,
    slug,
    role,
    image {
      asset,
      alt
    }
  },
  categories[]->{
    title,
    slug,
    color
  },
  contentType,
  publishedAt,
  readingTime
}`

export const postBySlugQuery = groq`*[_type == "post" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  excerpt,
  featuredImage {
    asset,
    alt
  },
  body,
  seoTitle,
  seoDescription,
  seoKeywords,
  canonicalUrl,
  author->{
    name,
    slug,
    role,
    bio,
    credentials,
    linkedin,
    twitter,
    image {
      asset,
      alt
    }
  },
  categories[]->{
    title,
    slug,
    color
  },
  contentType,
  publishedAt,
  updatedAt,
  readingTime,
  relatedPosts[]->{
    _id,
    title,
    slug,
    excerpt,
    featuredImage {
      asset,
      alt
    },
    publishedAt,
    readingTime
  }
}`

export const postSlugsQuery = groq`*[_type == "post" && defined(slug.current)][].slug.current`

export const categoriesQuery = groq`*[_type == "category"] | order(title asc) {
  _id,
  title,
  slug,
  description,
  color
}`

export const authorsQuery = groq`*[_type == "author"] | order(name asc) {
  _id,
  name,
  slug,
  role,
  bio,
  credentials,
  image {
    asset,
    alt
  }
}`
