import { defineType, defineField } from 'sanity'
import type { ComponentType } from 'react'
import PeoplevineCategoryPicker from '@/sanity/components/inputs/PeoplevineCategoryPicker'
import { CalendarIcon } from '@sanity/icons'

export default defineType({
  name: 'calendarSection',
  title: 'Calendar Section',
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
      name: 'eventCategories',
      title: 'Event Categories',
      type: 'array',
      of: [{ type: 'string' }],
      description:
        'Choose one or more event categories to use for this section.',
      components: {
        input: PeoplevineCategoryPicker as ComponentType<any>,
      },
    }),
  ],
  preview: {
    select: {
      heading: 'heading',
      eventCategories: 'eventCategories',
    },
    prepare({ eventCategories }) {
      const categories = Array.isArray(eventCategories)
        ? eventCategories.filter((item): item is string => typeof item === 'string')
        : []

      return {
        title: 'Calendar Section',
        subtitle: categories.length ? categories.join(', ') : 'No categories selected',
        media: CalendarIcon,
      }
    }
  }
})

