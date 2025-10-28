import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'eventSection',
  title: 'Event Section',
  type: 'object',
  fields: [
    defineField({
      name: 'id',
      title: 'ID',
      type: 'string',
    }),
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      options: {
        list: [
          { title: 'Single Event', value: 'single-event' },
          { title: '2 x Events', value: '2-events' },
          { title: '4 x Events', value: '4-events' },
        ],
      },
      initialValue: 'single-event',
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
    }),
    defineField({
      name: 'events',
      title: 'Events',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'event' }] }],
      validation: (Rule) =>
        Rule.custom((events, context) => {
          const parent = context.parent as { layout?: string }
          const layout = parent?.layout

          if (!layout) {
            return true // Allow if no layout is set yet
          }

          let maxEvents = 1
          if (layout === '2-events') {
            maxEvents = 2
          } else if (layout === '4-events') {
            maxEvents = 4
          }

          const eventsArray = events as unknown[] | undefined
          if (eventsArray && eventsArray.length > maxEvents) {
            return `You can only select ${maxEvents} event${maxEvents > 1 ? 's' : ''} for ${layout === '2-events' ? '2 Events' : layout === '4-events' ? '4 Events' : 'Single Event'} layout`
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
        title: 'Event Section',
        subtitle: layout === 'single-event' ? 'Single Event' : layout === '2-events' ? '2 Events' : layout === '4-events' ? '4 Events' : 'No Layout',
      }
    }
  }
})
