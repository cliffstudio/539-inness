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
      name: 'layout',
      title: 'Layout',
      type: 'string',
      options: {
        list: [
          { title: 'Single Feature', value: 'single-feature' },
          { title: '2 x Features', value: '2-features' },
          { title: '4 x Features', value: '4-features' },
        ],
      },
      initialValue: 'single-feature',
    }),
    defineField({
      name: 'feature1',
      title: 'Feature 1',
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
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'feature2',
      title: 'Feature 2',
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
      },
      hidden: ({ parent }) => {
        const layout = (parent as { layout?: string })?.layout
        return layout !== '2-features' && layout !== '4-features'
      },
      validation: (Rule) =>
        Rule.custom((feature2, context) => {
          const parent = context.parent as { layout?: string }
          const layout = parent?.layout
          if ((layout === '2-features' || layout === '4-features') && !feature2) {
            return 'Feature 2 is required for this layout'
          }
          return true
        }),
    }),
    defineField({
      name: 'feature3',
      title: 'Feature 3',
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
      },
      hidden: ({ parent }) => {
        const layout = (parent as { layout?: string })?.layout
        return layout !== '4-features'
      },
      validation: (Rule) =>
        Rule.custom((feature3, context) => {
          const parent = context.parent as { layout?: string }
          const layout = parent?.layout
          if (layout === '4-features' && !feature3) {
            return 'Feature 3 is required for this layout'
          }
          return true
        }),
    }),
    defineField({
      name: 'feature4',
      title: 'Feature 4',
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
      },
      hidden: ({ parent }) => {
        const layout = (parent as { layout?: string })?.layout
        return layout !== '4-features'
      },
      validation: (Rule) =>
        Rule.custom((feature4, context) => {
          const parent = context.parent as { layout?: string }
          const layout = parent?.layout
          if (layout === '4-features' && !feature4) {
            return 'Feature 4 is required for this layout'
          }
          return true
        }),
    }),
  ],
  preview: {
    select: {
      heading: 'heading',
      layout: 'layout',
    },
    prepare({ layout }) {
      return {
        title: 'Feature Section',
        subtitle: layout === 'single-feature' ? 'Single Feature' : layout === '2-features' ? '2 Features' : layout === '4-features' ? '4 Features' : 'No Layout',
      }
    }
  }
})
