import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'seo', title: 'SEO & Meta' },
    { name: 'settings', title: 'Settings' },
  ],
  fields: [
    // Content Group
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'content',
      validation: (Rule) => Rule.required().max(70).warning('Keep titles under 70 characters for SEO'),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt / Summary',
      type: 'text',
      rows: 3,
      group: 'content',
      description: 'TL;DR summary (40-60 words). This appears first and is what AI systems extract.',
      validation: (Rule) => Rule.required().max(300),
    }),
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      group: 'content',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'body',
      title: 'Body Content',
      type: 'portableText',
      group: 'content',
    }),

    // SEO Group
    defineField({
      name: 'seoTitle',
      title: 'SEO Title',
      type: 'string',
      group: 'seo',
      description: 'Override the default title for search engines (max 60 chars)',
      validation: (Rule) => Rule.max(60),
    }),
    defineField({
      name: 'seoDescription',
      title: 'Meta Description',
      type: 'text',
      rows: 2,
      group: 'seo',
      description: 'Description for search results (max 160 chars)',
      validation: (Rule) => Rule.max(160),
    }),
    defineField({
      name: 'seoKeywords',
      title: 'Target Keywords',
      type: 'array',
      of: [{ type: 'string' }],
      group: 'seo',
      description: 'Primary keywords this post targets',
    }),
    defineField({
      name: 'canonicalUrl',
      title: 'Canonical URL',
      type: 'url',
      group: 'seo',
      description: 'Only set if this content exists elsewhere (e.g., syndicated)',
    }),

    // Settings Group
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'author' }],
      group: 'settings',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'category' }] }],
      group: 'settings',
    }),
    defineField({
      name: 'contentType',
      title: 'Content Type',
      type: 'string',
      group: 'settings',
      options: {
        list: [
          { title: 'Guide', value: 'guide' },
          { title: 'Case Study', value: 'case-study' },
          { title: 'Comparison', value: 'comparison' },
          { title: 'Framework', value: 'framework' },
          { title: 'Benchmark / Data', value: 'benchmark' },
          { title: 'Industry Analysis', value: 'analysis' },
          { title: 'How-To', value: 'how-to' },
          { title: 'Opinion', value: 'opinion' },
        ],
      },
      description: 'Helps with schema markup and content organization',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published Date',
      type: 'datetime',
      group: 'settings',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'updatedAt',
      title: 'Last Updated',
      type: 'datetime',
      group: 'settings',
      description: 'Set when making significant updates (important for GEO freshness)',
    }),
    defineField({
      name: 'featured',
      title: 'Featured Post',
      type: 'boolean',
      group: 'settings',
      initialValue: false,
      description: 'Show this post prominently on the insights page',
    }),
    defineField({
      name: 'readingTime',
      title: 'Reading Time (minutes)',
      type: 'number',
      group: 'settings',
      description: 'Estimated reading time in minutes',
    }),
    defineField({
      name: 'relatedPosts',
      title: 'Related Posts',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'post' }] }],
      group: 'settings',
      validation: (Rule) => Rule.max(3),
    }),
  ],
  orderings: [
    {
      title: 'Published Date, Newest',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
    {
      title: 'Published Date, Oldest',
      name: 'publishedAtAsc',
      by: [{ field: 'publishedAt', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'featuredImage',
      publishedAt: 'publishedAt',
    },
    prepare({ title, author, media, publishedAt }) {
      const date = publishedAt ? new Date(publishedAt).toLocaleDateString() : 'Draft'
      return {
        title,
        subtitle: `${author || 'No author'} • ${date}`,
        media,
      }
    },
  },
})
