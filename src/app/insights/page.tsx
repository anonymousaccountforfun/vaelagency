import type { Metadata } from 'next'
import Script from 'next/script'
import { clientNoCache } from '../../../sanity/lib/client'
import { postsQuery, featuredPostsQuery, categoriesQuery } from '../../../sanity/lib/queries'
import type { PostSummary, Category } from '../../../sanity/lib/types'
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
  const [posts, featuredPosts, categories] = await Promise.all([
    clientNoCache.fetch<PostSummary[]>(postsQuery),
    clientNoCache.fetch<PostSummary[]>(featuredPostsQuery),
    clientNoCache.fetch<Category[]>(categoriesQuery),
  ])

  return {
    posts: posts || [],
    featuredPosts: featuredPosts || [],
    categories: categories || [],
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
