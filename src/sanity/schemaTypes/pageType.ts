import { defineType, defineField } from 'sanity'
import { DocumentTextIcon } from '@sanity/icons'

export const pageType = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
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
      name: 'pageType',
      title: 'Page Type',
      type: 'string',
      options: {
        list: [
          { title: 'Homepage', value: 'homepage' },
          { title: 'General Page', value: 'general' },
        ],
      },
    }),

    // Flexible content blocks
    defineField({
      name: 'contentBlocks',
      title: 'Content Blocks',
      type: 'flexibleContent',
      description: 'Add and arrange content blocks to build your page',
      hidden: ({ document }) => document?.pageType !== 'general',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      pageType: 'pageType',
    },
    prepare({ title, pageType }) {
      return {
        title: title,
        subtitle: pageType ? `${pageType.charAt(0).toUpperCase() + pageType.slice(1)} Page` : 'Page',
      }
    },
  },
})
