import { defineType, defineField } from 'sanity'
import { imageSizeValidation } from '../utils/imageValidation'

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
      name: 'images',
      title: 'Images',
      type: 'array',
      description: 'Maximum file size per image: 500KB.',
      of: [{ 
        type: 'image',
        validation: imageSizeValidation,
      }],
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
      media: 'image',
      heading: 'heading',
    },
    prepare({ media, heading }) {
      return {
        title: 'Hero Section',
        media: media,
        subtitle: heading || 'No Heading',
      }
    }
  }
})
