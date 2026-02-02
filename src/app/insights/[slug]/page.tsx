import type { Metadata } from 'next'
import Script from 'next/script'
import { notFound } from 'next/navigation'
import { clientNoCache } from '../../../../sanity/lib/client'
import { postBySlugQuery, postSlugsQuery } from '../../../../sanity/lib/queries'
import type { Post } from '../../../../sanity/lib/types'
import PostPageClient from './PostPageClient'

const baseUrl = 'https://vaelcreative.com'

interface PageProps {
  params: Promise<{ slug: string }>
}

// Generate static paths for all posts
export async function generateStaticParams() {
  const slugs = await clientNoCache.fetch<string[]>(postSlugsQuery)
  return slugs?.map((slug) => ({ slug })) || []
}

// Generate metadata for each post
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await clientNoCache.fetch<Post>(postBySlugQuery, { slug })

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  const title = post.seoTitle || post.title
  const description = post.seoDescription || post.excerpt

  return {
    title: `${title} | Vael Creative`,
    description,
    keywords: post.seoKeywords,
    authors: post.author ? [{ name: post.author.name }] : undefined,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `${baseUrl}/insights/${post.slug.current}`,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt || post.publishedAt,
      authors: post.author ? [post.author.name] : undefined,
      section: post.categories?.[0]?.title,
    },
    twitter: {
      card: 'summary_large_image',
      site: '@vaelcreative',
      creator: post.author?.twitter ? `@${post.author.twitter}` : '@vaelcreative',
      title,
      description,
    },
    alternates: {
      canonical: post.canonicalUrl || `${baseUrl}/insights/${post.slug.current}`,
    },
  }
}

export const revalidate = 60

async function getPost(slug: string): Promise<Post | null> {
  try {
    const post = await clientNoCache.fetch<Post>(postBySlugQuery, { slug })
    return post
  } catch (error) {
    console.error('Error fetching post:', error)
    return null
  }
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) {
    notFound()
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
    dateModified: post.updatedAt || post.publishedAt,
    author: post.author
      ? {
          '@type': 'Person',
          name: post.author.name,
          url: post.author.linkedin || `${baseUrl}/about`,
          jobTitle: post.author.role,
          ...(post.author.credentials && {
            knowsAbout: post.author.credentials,
          }),
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
    ...(post.seoKeywords?.length && {
      keywords: post.seoKeywords.join(', '),
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
