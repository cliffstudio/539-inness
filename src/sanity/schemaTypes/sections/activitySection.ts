import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'activitySection',
  title: 'Activity Section',
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
      name: 'layout',
      title: 'Layout',
      type: 'string',
      options: {
        list: [
          { title: 'Single Activity', value: 'single-activity' },
          { title: '2 x Activities', value: '2-activities' },
          { title: '4 x Activities', value: '4-activities' },
        ],
      },
      initialValue: 'single-activity',
    }),
    defineField({
      name: 'activity1',
      title: 'Activity 1',
      type: 'reference',
      to: [{ type: 'activity' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'activity2',
      title: 'Activity 2',
      type: 'reference',
      to: [{ type: 'activity' }],
      hidden: ({ parent }) => {
        const layout = (parent as { layout?: string })?.layout
        return layout !== '2-activities' && layout !== '4-activities'
      },
      validation: (Rule) =>
        Rule.custom((activity2, context) => {
          const parent = context.parent as { layout?: string }
          const layout = parent?.layout
          if ((layout === '2-activities' || layout === '4-activities') && !activity2) {
            return 'Activity 2 is required for this layout'
          }
          return true
        }),
    }),
    defineField({
      name: 'activity3',
      title: 'Activity 3',
      type: 'reference',
      to: [{ type: 'activity' }],
      hidden: ({ parent }) => {
        const layout = (parent as { layout?: string })?.layout
        return layout !== '4-activities'
      },
      validation: (Rule) =>
        Rule.custom((activity3, context) => {
          const parent = context.parent as { layout?: string }
          const layout = parent?.layout
          if (layout === '4-activities' && !activity3) {
            return 'Activity 3 is required for this layout'
          }
          return true
        }),
    }),
    defineField({
      name: 'activity4',
      title: 'Activity 4',
      type: 'reference',
      to: [{ type: 'activity' }],
      hidden: ({ parent }) => {
        const layout = (parent as { layout?: string })?.layout
        return layout !== '4-activities'
      },
      validation: (Rule) =>
        Rule.custom((activity4, context) => {
          const parent = context.parent as { layout?: string }
          const layout = parent?.layout
          if (layout === '4-activities' && !activity4) {
            return 'Activity 4 is required for this layout'
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
        title: 'Activity Section',
        subtitle: layout === 'single-activity' ? 'Single Activity' : layout === '2-activities' ? '2 Activities' : layout === '4-activities' ? '4 Activities' : 'No Layout',
      }
    }
  }
})

