import { defineType, defineField } from 'sanity'
import { VideoIcon } from '@sanity/icons'

export default defineType({
  name: 'heroSection',
  title: 'Hero Section',
  type: 'object',
  fields: [
    defineField({
      name: 'id',
      title: 'ID',
      type: 'string',
    }),
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      options: {
        list: [
          { title: 'Full Bleed Image & Content', value: 'full-bleed' },
          { title: 'Split Image & Content', value: 'split' },
        ],
      },
      initialValue: 'full-bleed',
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'mediaType',
      title: 'Media Type',
      type: 'string',
      initialValue: 'image',
      options: { list: ['image','video'] },
    }),
    defineField({ 
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [{ 
        type: 'image',
        options: {
          hotspot: true,
        },
      }],
      hidden: ({ parent }) => parent?.mediaType !== 'image',
    }),
    defineField({
      name: 'video',
      title: 'Video',
      type: 'bunnyVideo',
      hidden: ({ parent }) => parent?.mediaType !== 'video',
    }),
    defineField({
      name: 'specs',
      title: 'Specs',
      type: 'array',
      hidden: ({ parent }) => parent?.layout !== 'split',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'body',
              title: 'Body',
              type: 'string',
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'button',
      title: 'Button',
      type: 'link',
      hidden: ({ parent }) => parent?.layout !== 'split',
    }),
  ],
  preview: {
    select: {
      mediaType: 'mediaType',
      images: 'images',
    },
    prepare({ mediaType, images }) {
      const isVideo = mediaType === 'video'
      const title = 'Hero Section'
      const media = isVideo ? VideoIcon : images?.[0]
      return { title, media }
    }
  }
})
