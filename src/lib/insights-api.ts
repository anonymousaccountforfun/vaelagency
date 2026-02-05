/**
 * Client for fetching insights articles from the Dashboard API
 */

const DASHBOARD_API_URL = process.env.DASHBOARD_API_URL || 'http://localhost:3001'

// Types matching the API response format
export interface InsightAuthor {
  name: string
  slug: string
  image: string | null
  bio: string | null
}

export interface InsightArticle {
  slug: string
  title: string
  excerpt: string
  body: string // HTML content
  featuredImage: string | null
  publishedAt: string // ISO date
  author: InsightAuthor
  categories: string[]
}

export interface InsightsListResponse {
  articles: InsightArticle[]
}

export interface InsightsCategory {
  slug: string
  title: string
  count: number
}

/**
 * Fetch all published insights articles
 */
export async function getInsights(options?: {
  category?: string
  limit?: number
  offset?: number
}): Promise<{ articles: InsightArticle[]; categories: InsightsCategory[] }> {
  const params = new URLSearchParams()
  if (options?.category) params.set('category', options.category)
  if (options?.limit) params.set('limit', options.limit.toString())
  if (options?.offset) params.set('offset', options.offset.toString())

  const queryString = params.toString()
  const url = `${DASHBOARD_API_URL}/api/insights${queryString ? `?${queryString}` : ''}`

  try {
    const res = await fetch(url, {
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    })

    if (!res.ok) {
      console.error('Failed to fetch insights:', res.status, res.statusText)
      return { articles: [], categories: [] }
    }

    const data = await res.json()

    // Extract unique categories from articles
    const categoryMap = new Map<string, { title: string; count: number }>()
    for (const article of data.articles || []) {
      for (const cat of article.categories || []) {
        const slug = cat.toLowerCase().replace(/\s+/g, '-')
        const existing = categoryMap.get(slug)
        if (existing) {
          existing.count++
        } else {
          categoryMap.set(slug, { title: cat, count: 1 })
        }
      }
    }

    const categories = Array.from(categoryMap.entries()).map(([slug, data]) => ({
      slug,
      title: data.title,
      count: data.count,
    }))

    return {
      articles: data.articles || [],
      categories,
    }
  } catch (error) {
    console.error('Error fetching insights:', error)
    return { articles: [], categories: [] }
  }
}

/**
 * Fetch a single insight article by slug
 */
export async function getInsightBySlug(slug: string): Promise<InsightArticle | null> {
  const url = `${DASHBOARD_API_URL}/api/insights/${encodeURIComponent(slug)}`

  try {
    const res = await fetch(url, {
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    })

    if (!res.ok) {
      if (res.status === 404) {
        return null
      }
      console.error('Failed to fetch insight:', res.status, res.statusText)
      return null
    }

    return await res.json()
  } catch (error) {
    console.error('Error fetching insight by slug:', error)
    return null
  }
}

/**
 * Fetch all insight slugs (for static generation)
 */
export async function getAllInsightSlugs(): Promise<string[]> {
  const { articles } = await getInsights({ limit: 100 })
  return articles.map((article) => article.slug)
}
