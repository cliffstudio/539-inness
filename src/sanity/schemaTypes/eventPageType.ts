import { defineType, defineField } from 'sanity'
import { CalendarIcon } from '@sanity/icons'

export const calendarType = defineType({
  name: 'calendar',
  title: 'Calendar',
  type: 'document',
  icon: CalendarIcon,
  fields: [
    defineField({
      name: 'peoplevineId',
      title: 'Peoplevine ID',
      type: 'string',
      readOnly: true,
    }),
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
      readOnly: true,
      options: {
        source: 'title',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'startsAt',
      title: 'Starts at',
      type: 'datetime',
      readOnly: true,
      description: 'Stored in UTC by the API. Website displays this in America/New_York.',
    }),
    defineField({
      name: 'endsAt',
      title: 'Ends at',
      type: 'datetime',
      readOnly: true,
      description: 'Stored in UTC by the API. Website displays this in America/New_York.',
    }),
    defineField({
      name: 'locationName',
      title: 'Location name',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'locationAddress',
      title: 'Location address',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      readOnly: true,
    }),
    defineField({
      name: 'thumbnail',
      title: 'Thumbnail URL',
      type: 'url',
      readOnly: true,
    }),
    defineField({
      name: 'bookingHref',
      title: 'Booking URL',
      type: 'url',
      readOnly: true,
    }),
    defineField({
      name: 'eventCategories',
      title: 'Event Categories',
      type: 'array',
      of: [{ type: 'string' }],
      readOnly: true,
    }),
    defineField({
      name: 'lastSyncedAt',
      title: 'Last synced at',
      type: 'datetime',
      description: 'Stored in UTC by the API.',
      readOnly: true,
    }),
    defineField({
      name: 'isActive',
      title: 'Is active',
      type: 'boolean',
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      startsAt: 'startsAt',
      isActive: 'isActive',
    },
    prepare({ title, startsAt, isActive }) {
      const date =
        startsAt && typeof startsAt === 'string'
          ? new Intl.DateTimeFormat('en-GB', {
              timeZone: 'America/New_York',
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            }).format(new Date(startsAt))
          : undefined

      return {
        title: title || 'Untitled event',
        subtitle: [
          date ? `${date}` : undefined,
          isActive === false ? 'Inactive' : undefined,
        ]
          .filter(Boolean)
          .join(' • '),
      }
    },
  },
})

