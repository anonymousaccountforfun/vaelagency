'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { FadeInSection } from '@/components/AnimatedSection'

// Types for the insights data (can come from API or Sanity)
interface PostImage {
  url?: string // Direct URL from API
  asset?: { _ref: string } // Sanity reference
  alt?: string
}

interface PostAuthor {
  name: string
  slug?: { current: string }
  image?: PostImage | null
  role?: string
}

interface PostCategory {
  title: string
  slug: { current: string }
  color?: string
}

interface PostSummary {
  _id: string
  title: string
  slug: { current: string }
  excerpt: string
  featuredImage?: PostImage | null
  author?: PostAuthor | null
  categories?: PostCategory[]
  contentType?: string
  publishedAt: string
  updatedAt?: string
  featured?: boolean
  readingTime?: number
}

interface Category {
  _id?: string
  title: string
  slug: { current: string }
  description?: string
  color?: string
}

interface InsightsPageClientProps {
  posts: PostSummary[]
  featuredPosts: PostSummary[]
  categories: Category[]
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Helper to get image URL from either direct URL or Sanity format
function getImageUrl(image: PostImage | null | undefined): string | null {
  if (!image) return null
  // Direct URL from API
  if (image.url) return image.url
  // Sanity asset reference - would need urlFor, but we're not using Sanity for insights
  return null
}

function PostCard({ post, featured = false }: { post: PostSummary; featured?: boolean }) {
  const featuredImageUrl = getImageUrl(post.featuredImage)
  const authorImageUrl = post.author?.image ? getImageUrl(post.author.image) : null

  return (
    <Link href={`/insights/${post.slug.current}`} className="group block">
      <article className={`bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-md transition-shadow ${featured ? 'h-full' : ''}`}>
        {/* Image */}
        <div className={`relative bg-stone-100 ${featured ? 'aspect-[16/10]' : 'aspect-[16/9]'}`}>
          {featuredImageUrl ? (
            <Image
              src={featuredImageUrl}
              alt={post.featuredImage?.alt || post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes={featured ? '(max-width: 768px) 100vw, 66vw' : '(max-width: 768px) 100vw, 33vw'}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200">
              <span className="text-4xl font-medium text-stone-300">V</span>
            </div>
          )}
          {/* Category badge */}
          {post.categories?.[0] && (
            <span
              className="absolute top-4 left-4 px-3 py-1 text-xs font-medium rounded-full bg-white/90 backdrop-blur-sm text-stone-700"
            >
              {post.categories[0].title}
            </span>
          )}
        </div>

        {/* Content */}
        <div className={`p-6 ${featured ? 'lg:p-8' : ''}`}>
          {/* Content type & reading time */}
          <div className="flex items-center gap-3 text-xs text-stone-500 mb-3">
            {post.contentType && (
              <span className="uppercase tracking-wider">
                {post.contentType.replace('-', ' ')}
              </span>
            )}
            {post.readingTime && (
              <>
                <span>•</span>
                <span>{post.readingTime} min read</span>
              </>
            )}
          </div>

          <h3 className={`font-semibold text-stone-900 mb-3 group-hover:text-red-500 transition-colors ${featured ? 'text-2xl lg:text-3xl' : 'text-xl'}`}>
            {post.title}
          </h3>

          <p className={`text-stone-600 mb-4 line-clamp-2 ${featured ? 'text-base lg:text-lg' : 'text-sm'}`}>
            {post.excerpt}
          </p>

          {/* Author & date */}
          <div className="flex items-center gap-3">
            {authorImageUrl && (
              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-stone-200">
                <Image
                  src={authorImageUrl}
                  alt={post.author?.name || 'Author'}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="text-sm">
              {post.author?.name && (
                <span className="text-stone-900 font-medium">{post.author.name}</span>
              )}
              {post.publishedAt && (
                <span className="text-stone-500"> • {formatDate(post.publishedAt)}</span>
              )}
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}

export default function InsightsPageClient({ posts, featuredPosts, categories }: InsightsPageClientProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const filteredPosts = activeCategory
    ? posts.filter((post) =>
        post.categories?.some((cat) => cat.slug.current === activeCategory)
      )
    : posts

  // Separate featured from regular posts if no category filter
  const displayPosts = activeCategory
    ? filteredPosts
    : filteredPosts.filter((post) => !post.featured)

  const hasContent = posts.length > 0

  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 bg-background overflow-hidden">
        <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-stone-500 text-sm uppercase tracking-widest mb-6"
            >
              Insights
            </motion.p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium text-stone-900 mb-6">
              AI Creative & Marketing <span className="text-red-500">Strategy</span>
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-lg md:text-xl text-stone-600 max-w-3xl mx-auto"
            >
              Guides, frameworks, and analysis on AI-powered creative production for consumer brands. From creative testing to scaling operations.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {hasContent ? (
        <>
          {/* Category Filter */}
          {categories.length > 0 && (
            <section className="py-6 bg-background border-b border-stone-200">
              <div className="max-w-6xl mx-auto px-6 lg:px-8">
                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    onClick={() => setActiveCategory(null)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      activeCategory === null
                        ? 'bg-stone-900 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    All
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.slug.current}
                      onClick={() => setActiveCategory(category.slug.current)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        activeCategory === category.slug.current
                          ? 'bg-stone-900 text-white'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {category.title}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Featured Posts */}
          {!activeCategory && featuredPosts.length > 0 && (
            <section className="py-16 bg-background">
              <div className="max-w-6xl mx-auto px-6 lg:px-8">
                <FadeInSection>
                  <h2 className="text-sm uppercase tracking-widest text-stone-500 mb-8">
                    Featured
                  </h2>
                </FadeInSection>
                <div className="grid lg:grid-cols-2 gap-8">
                  {featuredPosts.slice(0, 2).map((post, index) => (
                    <motion.div
                      key={post._id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <PostCard post={post} featured />
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* All Posts Grid */}
          <section className="py-16 bg-background-secondary">
            <div className="max-w-6xl mx-auto px-6 lg:px-8">
              <FadeInSection>
                <h2 className="text-sm uppercase tracking-widest text-stone-500 mb-8">
                  {activeCategory ? `Filtered by ${categories.find((c) => c.slug.current === activeCategory)?.title}` : 'Latest Articles'}
                </h2>
              </FadeInSection>

              {displayPosts.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {displayPosts.map((post, index) => (
                    <motion.div
                      key={post._id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                    >
                      <PostCard post={post} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-stone-500">No articles found in this category.</p>
                </div>
              )}
            </div>
          </section>
        </>
      ) : (
        /* Empty State */
        <section className="py-20 bg-background-secondary">
          <div className="max-w-2xl mx-auto px-6 lg:px-8 text-center">
            <FadeInSection>
              <div className="w-16 h-16 rounded-full bg-stone-200 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">📝</span>
              </div>
              <h2 className="text-2xl font-semibold text-stone-900 mb-4">
                Coming Soon
              </h2>
              <p className="text-stone-600 mb-8">
                We&apos;re working on in-depth guides, frameworks, and case studies on AI-powered creative production. Check back soon for expert insights on scaling creative for consumer brands.
              </p>
              <Link
                href="/services"
                className="inline-flex items-center px-6 py-3 bg-stone-900 text-white font-medium rounded-full hover:bg-stone-800 transition-colors"
              >
                Explore Our Services
              </Link>
            </FadeInSection>
          </div>
        </section>
      )}

      {/* Newsletter CTA */}
      <section className="py-20 md:py-28 bg-warm-accent">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <FadeInSection>
            <h2 className="text-3xl md:text-4xl font-medium text-stone-900 mb-4">
              Get insights delivered
            </h2>
            <p className="text-stone-600 text-lg mb-8 max-w-2xl mx-auto">
              Subscribe for frameworks, case studies, and strategies on AI-powered creative production for consumer brands.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-5 py-3 rounded-full border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
              <button className="px-6 py-3 bg-stone-900 text-white font-medium rounded-full hover:bg-stone-800 transition-colors whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </FadeInSection>
        </div>
      </section>
    </>
  )
}
