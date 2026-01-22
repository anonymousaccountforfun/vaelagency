import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'media',
  title: 'Media',
  type: 'object',
  fields: [
    defineField({
      name: 'type',
      title: 'Media Type',
      type: 'string',
      options: {
        list: [
          { title: 'Image', value: 'image' },
          { title: 'Video', value: 'video' },
        ],
        layout: 'radio',
      },
      initialValue: 'image',
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      description: '📸 IMAGE SPECS: At least 1600px wide (2400px for full-bleed). Portrait photos: 800×1100px minimum. Use JPG or PNG.',
      options: { hotspot: true },
      hidden: ({ parent }) => parent?.type !== 'image',
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          description: 'Describe the image for accessibility',
        }),
      ],
    }),
    defineField({
      name: 'video',
      title: 'Video File (Upload)',
      type: 'file',
      description: '📤 Upload MP4, MOV, or WebM. Max ~100MB recommended. Use 1080p or higher.',
      options: {
        accept: 'video/*',
      },
      hidden: ({ parent }) => parent?.type !== 'video',
    }),
    defineField({
      name: 'videoUrl',
      title: 'Video URL (Alternative to upload)',
      type: 'url',
      description: '🔗 OR paste a YouTube, Vimeo, or direct video URL instead of uploading.',
      hidden: ({ parent }) => parent?.type !== 'video',
    }),
    defineField({
      name: 'videoPoster',
      title: 'Video Poster Image (thumbnail before play)',
      type: 'image',
      options: { hotspot: true },
      hidden: ({ parent }) => parent?.type !== 'video',
    }),
    defineField({
      name: 'autoplay',
      title: 'Autoplay (muted)',
      type: 'boolean',
      initialValue: true,
      hidden: ({ parent }) => parent?.type !== 'video',
    }),
    defineField({
      name: 'loop',
      title: 'Loop Video',
      type: 'boolean',
      initialValue: true,
      hidden: ({ parent }) => parent?.type !== 'video',
    }),
  ],
  preview: {
    select: {
      type: 'type',
      imageMedia: 'image',
      videoPoster: 'videoPoster',
    },
    prepare({ type, imageMedia, videoPoster }) {
      return {
        title: type === 'video' ? 'Video' : 'Image',
        media: type === 'video' ? videoPoster : imageMedia,
      }
    },
  },
})
