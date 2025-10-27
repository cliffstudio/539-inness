import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'textSection',
  title: 'Text Section',
  type: 'object',
  fields: [
    defineField({
      name: 'id',
      title: 'ID',
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
      name: 'button',
      title: 'Button',
      type: 'link',
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
    prepare({ heading }) {
      return {
        title: 'Text Section',
        subtitle: heading || 'No Heading',
      }
    }
  }
})
