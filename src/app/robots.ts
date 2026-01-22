import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://vaelagency.vercel.app'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/studio/', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
