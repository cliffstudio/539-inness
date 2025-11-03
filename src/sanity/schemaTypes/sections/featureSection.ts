/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineType, defineField } from 'sanity'
import { imageSizeValidation } from '../utils/imageValidation'

export default defineType({
  name: 'featureSection',
  title: 'Feature Section',
  type: 'object',
  fields: [
    defineField({
      name: 'id',
      title: 'ID',
      type: 'string',
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
      name: 'features',
      title: 'Features',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'feature',
          title: 'Feature',
          fields: [
            defineField({
              name: 'image',
              title: 'Image',
              type: 'image',
              description: 'Maximum file size: 500KB.',
              validation: imageSizeValidation,
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
              name: 'links',
              title: 'Links',
              type: 'array',
              of: [{ type: 'link' }],
            }),
          ],
          preview: {
            select: {
              heading: 'heading',
              media: 'image',
            },
            prepare({ heading, media }: any) {
              return {
                title: heading || 'Untitled Feature',
                media: media,
              }
            }
          }
        }
      ],
    }),
  ],
  preview: {
    select: {
      heading: 'heading',
      features: 'features',
    },
    prepare({ heading, features }) {
      return {
        media: features?.[0]?.image,
        title: 'Feature Section',
        subtitle: heading || 'No Heading',
      }
    }
  }
})
