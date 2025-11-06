import { defineType, defineField } from 'sanity'
import { imageSizeValidation } from '../utils/imageValidation'

export default defineType({
  name: 'detailedLink',
  title: 'Detailed Link',
  type: 'object',
  fields: [
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      description: 'Maximum file size: 500KB.',
      validation: imageSizeValidation,
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

