import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  fields: [
    defineField({
      name: 'hero',
      title: 'Hero Section',
      type: 'object',
      fields: [
        defineField({
          name: 'headline',
          title: 'Headline',
          type: 'string',
          description: 'Main headline (use \\n for line break)',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'subheadline',
          title: 'Subheadline',
          type: 'text',
          rows: 3,
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
    defineField({
      name: 'heroMedia',
      title: 'Hero Section Media (Full-bleed)',
      type: 'media',
      description: '🎬 VIDEO SUPPORTED • Full-width hero section. Images: 2400×1600px minimum, landscape. Videos: 1080p+, or paste YouTube/Vimeo URL.',
    }),
    defineField({
      name: 'services',
      title: 'Services Section',
      type: 'object',
      fields: [
        defineField({
          name: 'label',
          title: 'Section Label',
          type: 'string',
        }),
        defineField({
          name: 'headline',
          title: 'Section Headline',
          type: 'string',
        }),
        defineField({
          name: 'description',
          title: 'Section Description',
          type: 'text',
          rows: 2,
        }),
        defineField({
          name: 'items',
          title: 'Service Items',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
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
                defineField({
                  name: 'deliverables',
                  title: 'Deliverables',
                  type: 'array',
                  of: [{ type: 'string' }],
                }),
                defineField({
                  name: 'media',
                  title: 'Service Media',
                  type: 'media',
                  description: '🎬 VIDEO SUPPORTED • Images: 800×600px minimum. Videos: upload file or paste YouTube/Vimeo URL.',
                }),
              ],
              preview: {
                select: {
                  title: 'title',
                  media: 'media.image',
                },
              },
            },
          ],
        }),
        defineField({
          name: 'buttonText',
          title: 'Button Text',
          type: 'string',
        }),
        defineField({
          name: 'buttonLink',
          title: 'Button Link',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'socialProof',
      title: 'Social Proof Section',
      type: 'object',
      fields: [
        defineField({
          name: 'label',
          title: 'Section Label',
          type: 'string',
        }),
        defineField({
          name: 'headline',
          title: 'Section Headline',
          type: 'string',
        }),
        defineField({
          name: 'companies',
          title: 'Companies',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                defineField({
                  name: 'name',
                  title: 'Company Name',
                  type: 'string',
                }),
                defineField({
                  name: 'logo',
                  title: 'Logo (optional)',
                  type: 'image',
                }),
              ],
              preview: {
                select: {
                  title: 'name',
                  media: 'logo',
                },
              },
            },
          ],
        }),
        defineField({
          name: 'additionalText',
          title: 'Additional Text',
          type: 'string',
          description: 'e.g., "+ Harvard Business School, West Point"',
        }),
      ],
    }),
    defineField({
      name: 'localExpertise',
      title: 'Local Expertise Section',
      type: 'object',
      fields: [
        defineField({
          name: 'label',
          title: 'Section Label',
          type: 'string',
        }),
        defineField({
          name: 'headline',
          title: 'Section Headline',
          type: 'string',
        }),
        defineField({
          name: 'description',
          title: 'Description',
          type: 'text',
          rows: 3,
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
        defineField({
          name: 'stats',
          title: 'Stats',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                defineField({
                  name: 'number',
                  title: 'Number/Value',
                  type: 'string',
                }),
                defineField({
                  name: 'label',
                  title: 'Label',
                  type: 'string',
                }),
              ],
              preview: {
                select: {
                  title: 'number',
                  subtitle: 'label',
                },
              },
            },
          ],
        }),
      ],
    }),
    defineField({
      name: 'secondMedia',
      title: 'Second Full-bleed Media',
      type: 'media',
      description: '🎬 VIDEO SUPPORTED • Full-width section. Images: 2400×1600px minimum, landscape. Videos: 1080p+, or paste YouTube/Vimeo URL.',
    }),
    defineField({
      name: 'cta',
      title: 'Final CTA Section',
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
        title: 'Homepage',
      }
    },
  },
})
