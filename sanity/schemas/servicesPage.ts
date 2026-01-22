import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'servicesPage',
  title: 'Services Page',
  type: 'document',
  fields: [
    defineField({
      name: 'hero',
      title: 'Hero Section',
      type: 'object',
      fields: [
        defineField({
          name: 'label',
          title: 'Section Label',
          type: 'string',
        }),
        defineField({
          name: 'headline',
          title: 'Headline',
          type: 'string',
        }),
        defineField({
          name: 'description',
          title: 'Description',
          type: 'text',
          rows: 3,
        }),
      ],
    }),
    defineField({
      name: 'heroMedia',
      title: 'Hero Media (Full-bleed)',
      type: 'media',
      description: '🖼️ Full-width hero: Upload at least 2400×1600px for crisp display. Landscape orientation. For video, use 1080p or higher.',
    }),
    defineField({
      name: 'packages',
      title: 'Service Packages',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'name',
              title: 'Package Name',
              type: 'string',
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'text',
              rows: 3,
            }),
            defineField({
              name: 'deliverables',
              title: 'Deliverables',
              type: 'array',
              of: [{ type: 'string' }],
            }),
            defineField({
              name: 'timeline',
              title: 'Timeline',
              type: 'string',
            }),
            defineField({
              name: 'ideal',
              title: 'Ideal For',
              type: 'string',
            }),
          ],
          preview: {
            select: {
              title: 'name',
              subtitle: 'timeline',
            },
          },
        },
      ],
    }),
    defineField({
      name: 'process',
      title: 'Process Section',
      type: 'object',
      fields: [
        defineField({
          name: 'label',
          title: 'Section Label',
          type: 'string',
        }),
        defineField({
          name: 'headline',
          title: 'Headline',
          type: 'string',
        }),
        defineField({
          name: 'description',
          title: 'Description',
          type: 'text',
          rows: 2,
        }),
        defineField({
          name: 'steps',
          title: 'Process Steps',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                defineField({
                  name: 'step',
                  title: 'Step Number',
                  type: 'string',
                }),
                defineField({
                  name: 'title',
                  title: 'Title',
                  type: 'string',
                }),
                defineField({
                  name: 'description',
                  title: 'Description',
                  type: 'text',
                  rows: 2,
                }),
              ],
              preview: {
                select: {
                  title: 'title',
                  subtitle: 'step',
                },
              },
            },
          ],
        }),
      ],
    }),
    defineField({
      name: 'cta',
      title: 'CTA Section',
      type: 'object',
      fields: [
        defineField({
          name: 'headline',
          title: 'Headline',
          type: 'string',
        }),
        defineField({
          name: 'description',
          title: 'Description',
          type: 'text',
          rows: 2,
        }),
        defineField({
          name: 'primaryButtonText',
          title: 'Primary Button Text',
          type: 'string',
        }),
        defineField({
          name: 'primaryButtonLink',
          title: 'Primary Button Link',
          type: 'string',
        }),
        defineField({
          name: 'secondaryButtonText',
          title: 'Secondary Button Text',
          type: 'string',
        }),
        defineField({
          name: 'secondaryButtonLink',
          title: 'Secondary Button Link',
          type: 'string',
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Services Page',
      }
    },
  },
})
