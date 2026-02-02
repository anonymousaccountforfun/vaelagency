import homepage from './homepage'
import aboutPage from './aboutPage'
import servicesPage from './servicesPage'
import siteSettings from './siteSettings'
import media from './objects/media'
import portableText from './objects/portableText'
import post from './post'
import author from './author'
import category from './category'

export const schemaTypes = [
  // Object types
  media,
  portableText,
  // Blog content types
  post,
  author,
  category,
  // Singleton pages
  homepage,
  aboutPage,
  servicesPage,
  siteSettings,
]
