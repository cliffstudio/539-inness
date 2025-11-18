import { defineType, defineField } from 'sanity'
import { BasketIcon } from '@sanity/icons'

export const shopType = defineType({
  name: 'shop',
  title: 'Shop',
  type: 'document',
  icon: BasketIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'shopifyId',
      title: 'Shopify ID',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare(selection) {
      const { title } = selection
      return {
        title,
      }
    },
  },
  orderings: [
    {
      title: 'Title A-Z',
      name: 'titleAsc',
      by: [
        { field: 'title', direction: 'asc' }
      ]
    }
  ]
})
