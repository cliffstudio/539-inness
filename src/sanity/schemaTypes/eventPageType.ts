import { defineType, defineField, ALL_FIELDS_GROUP } from 'sanity'
import { CalendarIcon } from '@sanity/icons'

export const calendarType = defineType({
  name: 'calendar',
  title: 'Calendar',
  type: 'document',
  icon: CalendarIcon,
  groups: [
    {
      ...ALL_FIELDS_GROUP,
      hidden: true,
    },
    {
      name: 'content',
      title: 'Content',
    },
    {
      name: 'seo',
      title: 'SEO',
    }
  ],
  fields: [
    defineField({
      name: 'peoplevineId',
      title: 'Peoplevine ID',
      type: 'string',
      readOnly: true,
      group: 'content',
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      readOnly: true,
      group: 'content',
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
      group: 'content',
    }),
    defineField({
      name: 'startsAt',
      title: 'Starts at',
      type: 'datetime',
      readOnly: true,
      description: 'Stored in UTC by the API. Website displays this in America/New_York.',
      group: 'content',
    }),
    defineField({
      name: 'endsAt',
      title: 'Ends at',
      type: 'datetime',
      readOnly: true,
      description: 'Stored in UTC by the API. Website displays this in America/New_York.',
      group: 'content',
    }),
    defineField({
      name: 'locationName',
      title: 'Location name',
      type: 'string',
      readOnly: true,
      group: 'content',
    }),
    defineField({
      name: 'locationAddress',
      title: 'Location address',
      type: 'string',
      readOnly: true,
      group: 'content',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      readOnly: true,
      group: 'content',
    }),
    defineField({
      name: 'thumbnail',
      title: 'Thumbnail URL',
      type: 'url',
      readOnly: true,
      group: 'content',
    }),
    defineField({
      name: 'bookingHref',
      title: 'Booking URL',
      type: 'url',
      readOnly: true,
      group: 'content',
    }),
    defineField({
      name: 'eventCategories',
      title: 'Event Categories',
      type: 'array',
      of: [{ type: 'string' }],
      readOnly: true,
      group: 'content',
    }),
    defineField({
      name: 'lastSyncedAt',
      title: 'Last synced at',
      type: 'datetime',
      description: 'Stored in UTC by the API.',
      readOnly: true,
      group: 'content',
    }),
    defineField({
      name: 'isActive',
      title: 'Is active',
      type: 'boolean',
      readOnly: true,
      group: 'content',
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
      readOnly: true,
      description:
        'Auto-generated from this event: title -> meta title, description -> meta description, thumbnail -> social image URL.',
      group: 'seo',
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

