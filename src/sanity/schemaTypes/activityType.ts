import { defineType, defineField } from 'sanity'
import { CalendarIcon } from '@sanity/icons'
import { imageSizeValidation } from './utils/imageValidation'

export const activityType = defineType({
  name: 'activity',
  title: 'Activity',
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
      name: 'activityType',
      title: 'Activity Type',
      type: 'string',
      options: {
        list: [
          { title: 'Wellness', value: 'wellness' },
          { title: 'Food & Beverage', value: 'food-and-beverage' },
          { title: 'Kids', value: 'kids' },
          { title: 'Golf', value: 'golf' },
        ],
      },
      initialValue: 'wellness',
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
      name: 'bookingHref',
      title: 'Booking Href',
      type: 'url',
    }),
    defineField({ 
      name: 'images',
      title: 'Images',
      type: 'array',
      description: 'Maximum file size per image: 500KB.',
      of: [{ 
        type: 'image',
        validation: imageSizeValidation,
      }],
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
      activityType: 'activityType',
      date: 'date',
      startTime: 'timeRange.startTime',
      endTime: 'timeRange.endTime',
      media: 'image',
    },
    prepare(selection) {
      const { title, activityType, date, startTime, media } = selection

      // Capitalize activity type
      const capitalizedActivityType = activityType 
        ? activityType.charAt(0).toUpperCase() + activityType.slice(1).toLowerCase()
        : ''

      // Combine date and time for subtitle
      const combinedTitle = [title, capitalizedActivityType].filter(Boolean).join(' • ')
      
      // Format date as DDth Month YYYY (e.g., 25th July 2025)
      let formattedDate = ''
      if (date) {
        const dateObj = new Date(date)
        const day = dateObj.getDate()
        const month = dateObj.toLocaleString('en-US', { month: 'long' })
        const year = dateObj.getFullYear()
        
        // Add ordinal suffix (st, nd, rd, th)
        const getOrdinalSuffix = (n: number) => {
          const j = n % 10
          const k = n % 100
          if (j === 1 && k !== 11) return 'st'
          if (j === 2 && k !== 12) return 'nd'
          if (j === 3 && k !== 13) return 'rd'
          return 'th'
        }
        
        formattedDate = `${day}${getOrdinalSuffix(day)} ${month} ${year}`
      }
      
      // Format time range as "7.00am"
      const timeRange = startTime ? `${startTime}` : ''
      
      // Combine date and time for subtitle
      const subtitle = [formattedDate, timeRange].filter(Boolean).join(' • ')
      
      return {
        title: combinedTitle,
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

