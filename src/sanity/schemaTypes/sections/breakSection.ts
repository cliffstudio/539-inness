import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'breakSection',
  title: 'Break Section',
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
      name: 'subHeading',
      title: 'Sub Heading',
      type: 'string',
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
    }),
    defineField({
      name: 'button',
      title: 'Button',
      type: 'link',
      hidden: ({ parent }) => parent?.layout !== 'split',
    }),
    defineField({
      name: 'backgroundColour',
      title: 'Background Colour',
      type: 'string',
      options: {
        list: [
          { title: 'Black', value: 'black' },
          { title: 'Green', value: 'green' },
          { title: 'Orange', value: 'orange' },
        ],
      },
      initialValue: 'black',
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
        title: 'Break Section',
        media: media,
        subtitle: heading || 'No Heading',
      }
    }
  }
})
