import { defineType, defineField } from 'sanity'
import { CalendarIcon } from '@sanity/icons'

export const calendarType = defineType({
  name: 'calendar',
  title: 'Calendar',
  type: 'document',
  icon: CalendarIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      readOnly: true,
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
      name: 'peoplevineId', 
      title: 'Peoplevine ID',
      type: 'string', 
      readOnly: true 
    }),
    defineField({ 
      name: 'startsAt',
      title: 'Starts At',
      type: 'datetime', 
      readOnly: true 
    }),
    defineField({ 
      name: 'endsAt',
      title: 'Ends At',
      type: 'datetime', 
      readOnly: true 
    }),
    defineField({ 
      name: 'locationName',
      title: 'Location Name',
      type: 'string', 
      readOnly: true 
    }),
    defineField({ 
      name: 'locationAddress', 
      title: 'Location Address',
      type: 'string', 
      readOnly: true 
    }),
    defineField({ 
      name: 'lastSyncedAt',
      title: 'Last Synced At',
      type: 'datetime', 
      readOnly: true 
    }),
    // defineField({
    //   name: 'contentBlocks',
    //   title: 'Content Blocks',
    //   type: 'flexibleContent',
    // }),
  ],
  // preview: {
  //   select: {
  //     title: 'title',
  //     activityType: 'activityType',
  //     date: 'date',
  //     startTime: 'timeRange.startTime',
  //     endTime: 'timeRange.endTime',
  //     images: 'images',
  //   },
  //   prepare(selection) {
  //     const { title, activityType, date, startTime, images } = selection

  //     // Capitalize activity type
  //     const capitalizedActivityType = activityType 
  //       ? activityType.charAt(0).toUpperCase() + activityType.slice(1).toLowerCase()
  //       : ''

  //     // Combine date and time for subtitle
  //     const combinedTitle = [title, capitalizedActivityType].filter(Boolean).join(' • ')
      
  //     // Format date as DDth Month YYYY (e.g., 25th July 2025)
  //     let formattedDate = ''
  //     if (date) {
  //       const dateObj = new Date(date)
  //       const day = dateObj.getDate()
  //       const month = dateObj.toLocaleString('en-US', { month: 'long' })
  //       const year = dateObj.getFullYear()
        
  //       // Add ordinal suffix (st, nd, rd, th)
  //       const getOrdinalSuffix = (n: number) => {
  //         const j = n % 10
  //         const k = n % 100
  //         if (j === 1 && k !== 11) return 'st'
  //         if (j === 2 && k !== 12) return 'nd'
  //         if (j === 3 && k !== 13) return 'rd'
  //         return 'th'
  //       }
        
  //       formattedDate = `${day}${getOrdinalSuffix(day)} ${month} ${year}`
  //     }
      
  //     // Format time range as "7.00am"
  //     const timeRange = startTime ? `${startTime}` : ''
      
  //     // Combine date and time for subtitle
  //     const subtitle = [formattedDate, timeRange].filter(Boolean).join(' • ')
      
  //     return {
  //       title: combinedTitle,
  //       subtitle,
  //       media: images?.[0],
  //     }
  //   },
  // },
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
      name: 'startsAtDesc',
      by: [
        { field: 'startsAt', direction: 'desc' }
      ]
    },
    {
      title: 'Date (oldest first)',
      name: 'startsAtAsc',
      by: [
        { field: 'startsAt', direction: 'asc' }
      ]
    }
  ]
})

