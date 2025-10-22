import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'mediaTextSection',
  title: 'Media & Text Section',
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
          { title: 'Media with Text (h5)', value: 'media-with-text-h5' },
          { title: 'Media with Text (h4 & body)', value: 'media-with-text-h4-body' },
        ],
      },
      initialValue: 'media-with-text-h4-body',
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      hidden: ({ parent }) => parent?.layout == 'media-with-text-h5',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'buttons',
      title: 'Buttons',
      type: 'array',
      of: [{ type: 'link' }],
      hidden: ({ parent }) => parent?.layout == 'media-with-text-h5',
    }),
    defineField({
      name: 'mediaType',
      title: 'Media Type',
      type: 'string',
      initialValue: 'image',
      options: { list: ['image','video'] } }),
    defineField({ 
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [{ type: 'image' }],
      hidden: ({ parent }) => parent?.mediaType !== 'image'
    }),
    defineField({ 
      name: 'video', 
      title: 'Video',
      type: 'file', 
      options: { 
        accept: 'video/*' 
      },
      hidden: ({ parent }) => parent?.mediaType !== 'video'
    }),
    defineField({
      name: 'videoPlaceholder',
      title: 'Video Placeholder',
      type: 'image',
      hidden: ({ parent }) => parent?.mediaType !== 'video'
    }),
    defineField({
      name: 'mediaAlignment',
      title: 'Media Alignment',
      type: 'string',
      options: {
        list: [
          { title: 'Left', value: 'left' },
          { title: 'Right', value: 'right' },
        ],
      },
      initialValue: 'right',
    }),
  ],
  preview: {
    select: {
      media: 'images',
      mediaType: 'mediaType',
      videoPlaceholder: 'videoPlaceholder',
    },
    prepare({ media, mediaType, videoPlaceholder }) {
      return {
        title: 'Media & Text Section',
        media: mediaType === 'video' ? videoPlaceholder : media?.[0]
      }
    }
  }
})
