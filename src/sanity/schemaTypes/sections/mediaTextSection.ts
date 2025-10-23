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
          { title: 'Media with Text (room type)', value: 'media-with-text-room-type' },
          { title: 'Media with Text (h4 & bullet list)', value: 'media-with-text-h4-bullet-list' },
        ],
      },
      initialValue: 'media-with-text-h4-body',
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      hidden: ({ parent }) => parent?.layout !== 'media-with-text-h4-body' && parent?.layout !== 'media-with-text-h4-bullet-list',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [{ type: 'block' }],
      hidden: ({ parent }) => parent?.layout == 'media-with-text-room-type' || parent?.layout == 'media-with-text-h4-bullet-list',
    }),
    defineField({
      name: 'bulletList',
      title: 'Bullet List',
      type: 'array',
      of: [{ type: 'string' }],
      hidden: ({ parent }) => parent?.layout !== 'media-with-text-h4-bullet-list',
    }),
    defineField({
      name: 'buttons',
      title: 'Buttons',
      type: 'array',
      of: [{ type: 'link' }],
      hidden: ({ parent }) => parent?.layout !== 'media-with-text-h4-body',
    }),
    defineField({
      name: 'roomReference',
      title: 'Room Reference',
      type: 'reference',
      to: [{ type: 'room' }],
      hidden: ({ parent }) => parent?.layout !== 'media-with-text-room-type',
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
      heading: 'heading',
      layout: 'layout',
      body: 'body',
    },
    prepare({ media, mediaType, videoPlaceholder, heading, layout, body }) {
      return {
        title: 'Media & Text Section',
        media: mediaType === 'video' ? videoPlaceholder : media?.[0],
        subtitle: layout === 'media-with-text-room-type' ? 'Room Type' : layout === 'media-with-text-h5' ? body?.[0]?.children?.[0]?.text || 'No Body' : heading || 'No Heading',
      }
    }
  }
})
