import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'heroSection',
  title: 'Hero Section',
  type: 'object',
  fields: [
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      options: {
        list: [
          { title: 'Layout 1', value: 'layout-1' },
          { title: 'Layout 2', value: 'layout-2' },
        ],
      },
      initialValue: 'layout-1',
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
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'specs',
      title: 'Specs',
      type: 'array',
      hidden: ({ parent }) => parent?.layout !== 'layout-2',
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
      hidden: ({ parent }) => parent?.layout !== 'layout-2',
    }),
  ],
  preview: {
    select: {
      media: 'image',
    },
    prepare({ media }) {
      return {
        title: 'Hero Section',
        media: media
      }
    }
  }
})
