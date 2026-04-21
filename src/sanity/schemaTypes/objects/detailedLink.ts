import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'detailedLink',
  title: 'Detailed Link',
  type: 'object',
  fields: [
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'header',
      title: 'Header',
      type: 'string',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'richPortableText',
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'date',
    }),
    defineField({
      name: 'buttons',
      title: 'Buttons',
      type: 'array',
      of: [{ type: 'link' }],
    }),
  ],
  preview: {
    select: {
      header: 'header',
      image: 'image',
    },
    prepare({ header, image }) {
      return {
        title: header || 'Untitled Link',
        media: image,
      }
    }
  }
})

