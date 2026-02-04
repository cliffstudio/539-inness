import { defineType, defineField } from 'sanity'
import { imageSizeValidation } from '../utils/imageValidation'

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
          { title: 'Media with Text (h4, body & calendar links)', value: 'media-with-text-h4-body-activity-links' },
          { title: 'Media with Text (multiple text blocks)', value: 'media-with-text-multiple-text-blocks' },
        ],
      },
      initialValue: 'media-with-text-h4-body',
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      hidden: ({ parent }) => parent?.layout !== 'media-with-text-h4-body' && parent?.layout !== 'media-with-text-h4-bullet-list' && parent?.layout !== 'media-with-text-h4-body-room-links' && parent?.layout !== 'media-with-text-h4-body-links' && parent?.layout !== 'media-with-text-h4-body-activity-links',
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
            {
              name: 'layout',
              title: 'Layout',
              type: 'string',
              options: {
                list: [
                  { title: 'H4 with Text', value: 'h4-text' },
                  { title: 'H4 with Bullet List', value: 'h4-bullet-list' },
                ],
              },
              initialValue: 'h4-text',
            },
            { name: 'header', title: 'Header', type: 'string' },
            { 
              name: 'body', 
              title: 'Body', 
              type: 'array', 
              of: [{ type: 'block' }],
              hidden: ({ parent }) => parent?.layout === 'h4-bullet-list',
            },
            {
              name: 'bulletList',
              title: 'Bullet List',
              type: 'array',
              description: 'Add each bullet as a separate list item.',
              of: [
                {
                  type: 'object',
                  name: 'bulletItem',
                  fields: [
                    {
                      name: 'body',
                      title: 'Body',
                      type: 'array',
                      of: [{ type: 'block' }],
                    },
                  ],
                  preview: {
                    select: {
                      body: 'body',
                    },
                    prepare({ body }) {
                      const firstBlock = body?.[0]
                      const text = firstBlock?.children?.[0]?.text
                      return {
                        title: text || 'Bullet Item',
                      }
                    },
                  },
                },
              ],
              hidden: ({ parent }) => parent?.layout !== 'h4-bullet-list',
            },
          ],
          preview: {
            select: { title: 'header', layout: 'layout' },
            prepare({ title, layout }) {
              const layoutLabel = layout === 'h4-bullet-list' ? 'H4 + Bullet List' : 'H4 + Text'
              return { title: `${title || 'Untitled Text Block'} (${layoutLabel})` }
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
      description: 'Add each bullet as a separate list item.',
      of: [
        {
          type: 'object',
          name: 'bulletItem',
          fields: [
            {
              name: 'body',
              title: 'Body',
              type: 'array',
              of: [{ type: 'block' }],
            },
          ],
          preview: {
            select: {
              body: 'body',
            },
            prepare({ body }) {
              const firstBlock = body?.[0]
              const text = firstBlock?.children?.[0]?.text
              return {
                title: text || 'Bullet Item',
              }
            },
          },
        },
      ],
      hidden: ({ parent }) => parent?.layout !== 'media-with-text-h4-bullet-list',
    }),
    defineField({
      name: 'buttons',
      title: 'Buttons',
      type: 'array',
      of: [{ type: 'link' }],
      hidden: ({ parent }) => parent?.layout !== 'media-with-text-h4-body' && parent?.layout !== 'media-with-text-h4-body-room-links' && parent?.layout !== 'media-with-text-h4-body-links' && parent?.layout !== 'media-with-text-h4-bullet-list' && parent?.layout !== 'media-with-text-h4-body-activity-links',
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
      description: 'Maximum file size per image: 500KB.',
      of: [{ 
        type: 'image',
        validation: imageSizeValidation,
      }],
      hidden: ({ parent }) => parent?.mediaType !== 'image'
    }),
    defineField({ 
      name: 'video', 
      title: 'Video URL',
      description: 'Enter the Bunny.net video URL.',
      type: 'url',
      hidden: ({ parent }) => parent?.mediaType !== 'video',
    }),
    defineField({
      name: 'videoPlaceholder',
      title: 'Video Placeholder',
      type: 'image',
      description: 'Maximum file size: 500KB.',
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
      description: 'Add Room Links in even numbers (2, 4, 6, etc.)',
      validation: (Rule) =>
        Rule.custom((value) => {
          if (!value || value.length === 0) return true
          if (value.length < 2 || value.length % 2 !== 0) {
            return 'Room Links must be added in even numbers (2, 4, 6, etc.)'
          }
          return true
        }),
      hidden: ({ parent }) => parent?.layout !== 'media-with-text-h4-body-room-links',
    }),
    defineField({
      name: 'activityLinks',
      title: 'Calendar Links',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'activity' }] }],
      description: 'Add Calendar Links in even numbers (2, 4, 6, etc.)',
      validation: (Rule) =>
        Rule.custom((value) => {
          if (!value || value.length === 0) return true
          if (value.length < 2 || value.length % 2 !== 0) {
            return 'Calendar Links must be added in even numbers (2, 4, 6, etc.)'
          }
          return true
        }),
      hidden: ({ parent }) => parent?.layout !== 'media-with-text-h4-body-activity-links',
    }),
    defineField({
      name: 'links',
      title: 'Links',
      type: 'array',
      of: [{ type: 'detailedLink' }],
      description: 'Add Links in sets of either 2 or 4.',
      validation: (Rule) =>
        Rule.custom((value) => {
          if (!value || value.length === 0) return true
          if (![2, 4].includes(value.length)) {
            return 'Links must be added in sets of either 2 or 4.'
          }
          return true
        }),
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
