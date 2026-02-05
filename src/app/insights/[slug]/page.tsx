import type { Metadata } from 'next'
import Script from 'next/script'
import { notFound } from 'next/navigation'
import { getInsightBySlug, getAllInsightSlugs } from '@/lib/insights-api'
import PostPageClient from './PostPageClient'

const baseUrl = 'https://vaelcreative.com'

interface PageProps {
  params: Promise<{ slug: string }>
}

// Generate static paths for all posts
export async function generateStaticParams() {
  const slugs = await getAllInsightSlugs()
  return slugs.map((slug) => ({ slug }))
}

// Generate metadata for each post
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getInsightBySlug(slug)

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  const title = post.title
  const description = post.excerpt

  return {
    title: `${title} | Vael Creative`,
    description,
    authors: post.author ? [{ name: post.author.name }] : undefined,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `${baseUrl}/insights/${post.slug}`,
      publishedTime: post.publishedAt,
      authors: post.author ? [post.author.name] : undefined,
      section: post.categories?.[0],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@vaelcreative',
      creator: '@vaelcreative',
      title,
      description,
    },
    alternates: {
      canonical: `${baseUrl}/insights/${post.slug}`,
    },
  }
}

export const revalidate = 60

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params
  const article = await getInsightBySlug(slug)

  if (!article) {
    notFound()
  }

  // Transform API response to match PostPageClient props
  const post = {
    _id: article.slug,
    title: article.title,
    slug: { current: article.slug },
    excerpt: article.excerpt,
    body: article.body, // HTML content
    featuredImage: article.featuredImage ? { url: article.featuredImage } : null,
    author: article.author ? {
      name: article.author.name,
      slug: { current: article.author.slug },
      bio: article.author.bio || undefined,
      image: article.author.image ? { url: article.author.image } : null,
    } : null,
    categories: article.categories.map((cat) => ({
      title: cat,
      slug: { current: cat.toLowerCase().replace(/\s+/g, '-') },
    })),
    publishedAt: article.publishedAt,
    readingTime: Math.ceil(article.body.replace(/<[^>]+>/g, '').split(/\s+/).length / 200),
  }

  // Article schema
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${baseUrl}/insights/${post.slug.current}`,
    headline: post.title,
    description: post.excerpt,
    url: `${baseUrl}/insights/${post.slug.current}`,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: post.author
      ? {
          '@type': 'Person',
          name: post.author.name,
          url: `${baseUrl}/about`,
        }
      : {
          '@type': 'Organization',
          name: 'Vael Creative',
          url: baseUrl,
        },
    publisher: {
      '@type': 'Organization',
      name: 'Vael Creative',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/images/vael-creative-logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/insights/${post.slug.current}`,
    },
    ...(post.categories?.length && {
      articleSection: post.categories[0].title,
    }),
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
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `${baseUrl}/insights/${post.slug.current}`,
      },
    ],
  }

  return (
    <>
      <Script
        id="article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <PostPageClient post={post} />
    </>
  )
}
