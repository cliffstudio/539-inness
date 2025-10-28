import { defineType, defineField } from 'sanity'
import { CalendarIcon } from '@sanity/icons'

export const eventType = defineType({
  name: 'event',
  title: 'Event',
  type: 'document',
  icon: CalendarIcon,
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
      name: 'eventType',
      title: 'Event Type',
      type: 'string',
      options: {
        list: [
          { title: 'Spa', value: 'spa' },
          { title: 'Golf', value: 'golf' },
        ],
      },
      initialValue: 'spa',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'date',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'timeRange',
      title: 'Time Range',
      type: 'object',
      fields: [
        defineField({
          name: 'startTime',
          title: 'Start Time',
          type: 'string',
          description: 'e.g., "7.00am"',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'endTime',
          title: 'End Time',
          type: 'string',
          description: 'e.g., "8.00am"',
        }),
      ],
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
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
      date: 'date',
      startTime: 'timeRange.startTime',
      endTime: 'timeRange.endTime',
      media: 'image',
    },
    prepare(selection) {
      const { title, date, startTime, endTime, media } = selection
      
      // Format date as DD Month YYYY
      let formattedDate = ''
      if (date) {
        const dateObj = new Date(date)
        const day = dateObj.getDate()
        const month = dateObj.toLocaleString('en-US', { month: 'long' })
        const year = dateObj.getFullYear()
        formattedDate = `${day} ${month} ${year}`
      }
      
      // Format time range as "7.00am-8.00am"
      const timeRange = startTime ? `${startTime}` : ''
      
      // Combine date and time for subtitle
      const subtitle = [formattedDate, timeRange].filter(Boolean).join(' • ')
      
      return {
        title,
        subtitle,
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
    },
    {
      title: 'Date (newest first)',
      name: 'dateDesc',
      by: [
        { field: 'date', direction: 'desc' }
      ]
    },
    {
      title: 'Date (oldest first)',
      name: 'dateAsc',
      by: [
        { field: 'date', direction: 'asc' }
      ]
    }
  ]
})
