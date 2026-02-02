'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { FadeInSection } from '@/components/AnimatedSection'
import PortableTextRenderer from '@/components/PortableTextRenderer'
import { urlFor } from '../../../../sanity/lib/client'
import { useContactModal } from '@/components/ContactModalContext'
import type { Post } from '../../../../sanity/lib/types'

interface PostPageClientProps {
  post: Post
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function PostPageClient({ post }: PostPageClientProps) {
  const { openModal } = useContactModal()

  return (
    <>
      {/* Hero / Header */}
      <article className="bg-background">
        <header className="pt-32 pb-12 md:pt-40 md:pb-16">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            {/* Breadcrumb */}
            <motion.nav
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <ol className="flex items-center gap-2 text-sm text-stone-500">
                <li>
                  <Link href="/" className="hover:text-stone-900 transition-colors">
                    Home
                  </Link>
                </li>
                <li>/</li>
                <li>
                  <Link href="/insights" className="hover:text-stone-900 transition-colors">
                    Insights
                  </Link>
                </li>
                <li>/</li>
                <li className="text-stone-900 truncate max-w-[200px]">{post.title}</li>
              </ol>
            </motion.nav>

            {/* Category & Meta */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-wrap items-center gap-3 mb-6"
            >
              {post.categories?.[0] && (
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-stone-100 text-stone-700">
                  {post.categories[0].title}
                </span>
              )}
              {post.contentType && (
                <span className="text-xs text-stone-500 uppercase tracking-wider">
                  {post.contentType.replace('-', ' ')}
                </span>
              )}
              {post.readingTime && (
                <span className="text-xs text-stone-500">
                  {post.readingTime} min read
                </span>
              )}
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-3xl md:text-4xl lg:text-5xl font-medium text-stone-900 mb-6 leading-tight"
            >
              {post.title}
            </motion.h1>

            {/* Excerpt / TL;DR - Important for GEO */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-xl text-stone-600 leading-relaxed mb-8"
            >
              {post.excerpt}
            </motion.p>

            {/* Author & Date */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex items-center gap-4 pb-8 border-b border-stone-200"
            >
              {post.author?.image?.asset && (
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-stone-200">
                  <Image
                    src={urlFor(post.author.image).width(96).height(96).url()}
                    alt={post.author.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div>
                {post.author && (
                  <div className="font-medium text-stone-900">
                    {post.author.name}
                    {post.author.role && (
                      <span className="font-normal text-stone-500 ml-2">
                        {post.author.role}
                      </span>
                    )}
                  </div>
                )}
                <div className="text-sm text-stone-500">
                  {post.publishedAt && formatDate(post.publishedAt)}
                  {post.updatedAt && post.updatedAt !== post.publishedAt && (
                    <span> · Updated {formatDate(post.updatedAt)}</span>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </header>

        {/* Featured Image */}
        {post.featuredImage?.asset && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-5xl mx-auto px-6 lg:px-8 mb-12"
          >
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-stone-100">
              <Image
                src={urlFor(post.featuredImage).width(1200).height(675).url()}
                alt={post.featuredImage.alt || post.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 1024px"
              />
            </div>
          </motion.div>
        )}

        {/* Body Content */}
        <div className="max-w-3xl mx-auto px-6 lg:px-8 pb-16">
          <FadeInSection>
            {post.body && <PortableTextRenderer value={post.body} />}
          </FadeInSection>

          {/* Author Bio Box */}
          {post.author && (
            <FadeInSection delay={0.2}>
              <div className="mt-16 p-8 bg-stone-50 rounded-2xl border border-stone-200">
                <div className="flex items-start gap-4">
                  {post.author.image?.asset && (
                    <div className="relative w-16 h-16 rounded-full overflow-hidden bg-stone-200 flex-shrink-0">
                      <Image
                        src={urlFor(post.author.image).width(128).height(128).url()}
                        alt={post.author.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-stone-900 text-lg">
                      {post.author.name}
                    </h3>
                    {post.author.role && (
                      <p className="text-stone-500 text-sm mb-2">{post.author.role}</p>
                    )}
                    {post.author.bio && (
                      <p className="text-stone-600 mb-3">{post.author.bio}</p>
                    )}
                    {post.author.credentials && post.author.credentials.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {post.author.credentials.map((credential, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 text-xs rounded bg-stone-200 text-stone-600"
                          >
                            {credential}
                          </span>
                        ))}
                      </div>
                    )}
                    {post.author.linkedin && (
                      <a
                        href={post.author.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-3 text-sm text-stone-600 hover:text-stone-900 transition-colors"
                      >
                        Connect on LinkedIn →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </FadeInSection>
          )}

          {/* Related Posts */}
          {post.relatedPosts && post.relatedPosts.length > 0 && (
            <FadeInSection delay={0.3}>
              <div className="mt-16">
                <h2 className="text-xl font-semibold text-stone-900 mb-6">
                  Related Articles
                </h2>
                <div className="grid gap-6">
                  {post.relatedPosts.map((related) => (
                    <Link
                      key={related._id}
                      href={`/insights/${related.slug.current}`}
                      className="group flex gap-4 p-4 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors"
                    >
                      {related.featuredImage?.asset && (
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-stone-200 flex-shrink-0">
                          <Image
                            src={urlFor(related.featuredImage).width(192).height(192).url()}
                            alt={related.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium text-stone-900 group-hover:text-red-500 transition-colors mb-1">
                          {related.title}
                        </h3>
                        <p className="text-sm text-stone-500 line-clamp-2">
                          {related.excerpt}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </FadeInSection>
          )}
        </div>
      </article>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-warm-accent">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <FadeInSection>
            <h2 className="text-3xl md:text-4xl font-medium text-stone-900 mb-4">
              Ready to scale your creative?
            </h2>
            <p className="text-stone-600 text-lg mb-8 max-w-2xl mx-auto">
              Let&apos;s discuss how AI-accelerated creative production can help your brand grow faster.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                onClick={openModal}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-8 py-4 bg-stone-900 text-white font-medium rounded-full hover:bg-stone-800 transition-colors"
              >
                Book a Call
              </motion.button>
              <motion.a
                href="/services"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-8 py-4 bg-transparent text-stone-900 font-medium rounded-full border border-stone-400 hover:border-stone-500 hover:bg-white/50 transition-all"
              >
                View Services
              </motion.a>
            </div>
          </FadeInSection>
        </div>
      </section>
    </>
  )
}
