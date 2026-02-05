import type { Metadata } from 'next'
import Script from 'next/script'
import { getInsights } from '@/lib/insights-api'
import InsightsPageClient from './InsightsPageClient'

const baseUrl = 'https://vaelcreative.com'

export const metadata: Metadata = {
  title: 'Insights | AI Creative & Marketing Strategy | Vael Creative',
  description: 'Expert guides, frameworks, and analysis on AI-powered creative production, performance marketing, and scaling creative operations for consumer brands.',
  keywords: [
    'AI creative production',
    'creative agency insights',
    'DTC marketing',
    'ad creative strategy',
    'performance creative',
    'consumer brand marketing',
    'AI marketing',
  ],
  openGraph: {
    title: 'Insights | AI Creative & Marketing Strategy',
    description: 'Expert guides on AI-powered creative production for consumer brands.',
    type: 'website',
    url: `${baseUrl}/insights`,
  },
  twitter: {
    card: 'summary_large_image',
    site: '@vaelcreative',
    creator: '@vaelcreative',
    title: 'Insights | AI Creative & Marketing Strategy',
    description: 'Expert guides on AI-powered creative production for consumer brands.',
  },
  alternates: {
    canonical: `${baseUrl}/insights`,
  },
}

export const revalidate = 60

async function getInsightsData() {
  const { articles, categories } = await getInsights()

  // Transform API response to match component props
  // Map articles to the PostSummary format expected by InsightsPageClient
  const posts = articles.map((article) => ({
    _id: article.slug, // Use slug as ID
    title: article.title,
    slug: { current: article.slug },
    excerpt: article.excerpt,
    featuredImage: article.featuredImage ? { url: article.featuredImage } : null,
    author: article.author ? {
      name: article.author.name,
      slug: { current: article.author.slug },
      image: article.author.image ? { url: article.author.image } : null,
    } : null,
    categories: article.categories.map((cat) => ({
      title: cat,
      slug: { current: cat.toLowerCase().replace(/\s+/g, '-') },
    })),
    publishedAt: article.publishedAt,
    featured: false, // API doesn't have featured flag
    readingTime: Math.ceil(article.body.replace(/<[^>]+>/g, '').split(/\s+/).length / 200), // Estimate from body
  }))

  // Transform categories to match component props
  const categoryList = categories.map((cat) => ({
    _id: cat.slug,
    title: cat.title,
    slug: { current: cat.slug },
  }))

  return {
    posts,
    featuredPosts: [], // No featured posts from API
    categories: categoryList,
  }
}

// Breadcrumb schema
const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: baseUrl,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Insights',
      item: `${baseUrl}/insights`,
    },
  ],
}

// Blog schema
const blogSchema = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  '@id': `${baseUrl}/insights`,
  name: 'Vael Creative Insights',
  description: 'Expert guides, frameworks, and analysis on AI-powered creative production for consumer brands.',
  url: `${baseUrl}/insights`,
  publisher: {
    '@type': 'Organization',
    name: 'Vael Creative',
    url: baseUrl,
  },
}

export default async function InsightsPage() {
  const { posts, featuredPosts, categories } = await getInsightsData()

  return (
    <>
      <Script
        id="insights-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="blog-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      <InsightsPageClient
        posts={posts}
        featuredPosts={featuredPosts}
        categories={categories}
      />
    </>
  )
}
