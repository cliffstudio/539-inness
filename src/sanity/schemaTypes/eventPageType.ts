import { defineType, defineField } from 'sanity'
import { CalendarIcon } from '@sanity/icons'

export const calendarType = defineType({
  name: 'calendar',
  title: 'Calendar',
  type: 'document',
  icon: CalendarIcon,
  // groups: [
  //   {
  //     name: 'synced',
  //     title: 'Synced event data',
  //   },
  //   {
  //     name: 'content',
  //     title: 'Page content',
  //   },
  // ],
  fields: [
    // Synced / read-only fields
    defineField({
      name: 'peoplevineId',
      title: 'Peoplevine ID',
      type: 'string',
      readOnly: true,
      // group: 'synced',
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      readOnly: true,
      // group: 'synced',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      readOnly: true,
      // group: 'synced',
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
      // group: 'synced',
    }),
    defineField({
      name: 'endsAt',
      title: 'Ends at',
      type: 'datetime',
      readOnly: true,
      // group: 'synced',
    }),
    defineField({
      name: 'locationName',
      title: 'Location name',
      type: 'string',
      readOnly: true,
      // group: 'synced',
    }),
    defineField({
      name: 'locationAddress',
      title: 'Location address',
      type: 'string',
      readOnly: true,
      // group: 'synced',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      readOnly: true,
      // group: 'synced',
    }),
    defineField({
      name: 'thumbnail',
      title: 'Thumbnail URL',
      type: 'url',
      readOnly: true,
      // group: 'synced',
    }),
    defineField({
      name: 'bookingHref',
      title: 'Booking URL',
      type: 'url',
      readOnly: true,
      // group: 'synced',
    }),
    defineField({
      name: 'eventCategories',
      title: 'Event Categories',
      type: 'array',
      of: [{ type: 'string' }],
      readOnly: true,
      // group: 'synced',
    }),
    defineField({
      name: 'lastSyncedAt',
      title: 'Last synced at',
      type: 'datetime',
      readOnly: true,
      // group: 'synced',
    }),
    defineField({
      name: 'isActive',
      title: 'Is active',
      type: 'boolean',
      readOnly: true,
      // group: 'synced',
    }),

    // Editor-controlled fields
    // defineField({
    //   name: 'contentBlocks',
    //   title: 'Content Blocks',
    //   type: 'flexibleContent',
    //   group: 'content',
    // }),
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
          ? new Date(startsAt).toLocaleString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : undefined

      return {
        title: title || 'Untitled event',
        subtitle: [date, isActive === false ? 'Inactive' : undefined]
          .filter(Boolean)
          .join(' • '),
      }
    },
  },
})

