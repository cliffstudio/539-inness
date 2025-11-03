import { defineType, defineField } from 'sanity'
import { imageSizeValidation } from '../utils/imageValidation'
import { videoSizeValidation } from '../utils/videoValidation'

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
          { title: 'Media with Text (h4, body & links)', value: 'media-with-text-h4-body-links' },
          { title: 'Media with Text (h4, body & room links)', value: 'media-with-text-h4-body-room-links' },
          { title: 'Media with Text (multiple text blocks)', value: 'media-with-text-multiple-text-blocks' },
        ],
      },
      initialValue: 'media-with-text-h4-body',
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      hidden: ({ parent }) => parent?.layout !== 'media-with-text-h4-body' && parent?.layout !== 'media-with-text-h4-bullet-list' && parent?.layout !== 'media-with-text-h4-body-room-links' && parent?.layout !== 'media-with-text-h4-body-links',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [{ type: 'block' }],
      hidden: ({ parent }) => parent?.layout === 'media-with-text-room-type' || parent?.layout === 'media-with-text-h4-bullet-list' || parent?.layout === 'media-with-text-multiple-text-blocks',
    }),
    defineField({
      name: 'textBlocks',
      title: 'Text Blocks',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'textBlock',
          fields: [
            { name: 'header', title: 'Header', type: 'string' },
            { name: 'body', title: 'Body', type: 'array', of: [{ type: 'block' }] },
          ],
          preview: {
            select: { title: 'header' },
            prepare({ title }) {
              return { title: title || 'Untitled Text Block' }
            },
          },
        },
      ],
      hidden: ({ parent }) => parent?.layout !== 'media-with-text-multiple-text-blocks',
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
      hidden: ({ parent }) => parent?.layout !== 'media-with-text-h4-body' && parent?.layout !== 'media-with-text-h4-body-room-links' && parent?.layout !== 'media-with-text-h4-body-links' && parent?.layout !== 'media-with-text-h4-bullet-list',
    }),
    defineField({
      name: 'roomLink',
      title: 'Room Link',
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
      of: [{ 
        type: 'image',
        validation: imageSizeValidation,
      }],
      hidden: ({ parent }) => parent?.mediaType !== 'image'
    }),
    defineField({ 
      name: 'video', 
      title: 'Video',
      type: 'file', 
      options: { 
        accept: 'video/mp4,.mp4' 
      },
      hidden: ({ parent }) => parent?.mediaType !== 'video',
      validation: videoSizeValidation,
    }),
    defineField({
      name: 'videoPlaceholder',
      title: 'Video Placeholder',
      type: 'image',
      hidden: ({ parent }) => parent?.mediaType !== 'video',
      validation: imageSizeValidation,
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
    defineField({
      name: 'roomLinks',
      title: 'Room Links',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'room' }] }],
      validation: (Rule) => Rule.min(2).custom((value) => {
        if (!value || value.length === 0) return true // Allow empty array
        if (value.length % 2 !== 0) {
          return 'Room Links must be added in multiples of 2 (2, 4, 6, etc.)'
        }
        return true
      }),
      hidden: ({ parent }) => parent?.layout !== 'media-with-text-h4-body-room-links',
    }),
    defineField({
      name: 'links',
      title: 'Links',
      type: 'array',
      of: [{ type: 'detailedLink' }],
      hidden: ({ parent }) => parent?.layout !== 'media-with-text-h4-body-links',
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
        subtitle: layout === 'media-with-text-room-type' ? 'Room Type' : layout === 'media-with-text-h5' ? body?.[0]?.children?.[0]?.text || 'No Body' : layout === 'media-with-text-multiple-text-blocks' ? 'Multiple Text Blocks' : heading || 'No Heading',
      }
    }
  }
})
