import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://vaelcreative.com'

  return [
    {
      url: baseUrl,
      lastModified: new Date('2025-01-22'),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date('2025-01-22'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date('2025-01-22'),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ]
}
