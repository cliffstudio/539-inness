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
      type: 'string',
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {
        source: 'title',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'pageType',
      type: 'string',
      options: {
        list: [
          { title: 'Homepage', value: 'homepage' },
          { title: 'Press', value: 'press' },
          { title: 'General Page', value: 'general' },
        ],
      },
    }),
    
    // Hero section - available for all page types
    defineField({
      name: 'hero',
      title: 'Hero',
      type: 'heroSection',
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
