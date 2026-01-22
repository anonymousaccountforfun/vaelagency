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
      options: { hotspot: true },
      hidden: ({ parent }) => parent?.type !== 'image',
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'video',
      title: 'Video File',
      type: 'file',
      options: {
        accept: 'video/*',
      },
      hidden: ({ parent }) => parent?.type !== 'video',
    }),
    defineField({
      name: 'videoUrl',
      title: 'Video URL (YouTube, Vimeo, or direct link)',
      type: 'url',
      description: 'Paste a YouTube, Vimeo, or direct video URL',
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
