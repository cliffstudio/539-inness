import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'bookingSection',
  title: 'Booking Section',
  type: 'object',
  fields: [
    defineField({
      name: 'id',
      title: 'ID',
      type: 'string',
      hidden: true,
    }),
    defineField({
      name: 'show',
      title: 'Show Section',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'noTopPad',
      title: 'No Top Padding',
      type: 'boolean',
      initialValue: false,
      description: 'Remove top padding from the booking section',
    }),
    defineField({
      name: 'noBottomPad',
      title: 'No Bottom Padding',
      type: 'boolean',
      initialValue: false,
      description: 'Remove bottom padding from the booking section',
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Booking Section',
      }
    }
  }
})

