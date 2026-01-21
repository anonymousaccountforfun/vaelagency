import { groq } from 'next-sanity'

export const homepageQuery = groq`*[_type == "homepage"][0]{
  hero,
  heroImage,
  services,
  socialProof,
  localExpertise,
  secondImage,
  cta
}`

export const aboutPageQuery = groq`*[_type == "aboutPage"][0]{
  hero,
  founders,
  story,
  teamImage,
  cta
}`

export const servicesPageQuery = groq`*[_type == "servicesPage"][0]{
  hero,
  heroImage,
  packages,
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
