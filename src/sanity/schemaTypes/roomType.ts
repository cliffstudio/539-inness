import { defineType, defineField } from 'sanity'
import { HomeIcon } from '@sanity/icons'

export const roomType = defineType({
  name: 'room',
  title: 'Room',
  type: 'document',
  icon: HomeIcon,
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
      name: 'contentBlocks',
      title: 'Content Blocks',
      type: 'flexibleContent',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'contentBlocks.0.image',
    },
    prepare(selection) {
      const { title, media } = selection
      return {
        title,
        media,
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
