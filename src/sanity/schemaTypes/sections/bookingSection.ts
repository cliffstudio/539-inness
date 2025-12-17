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
  ],
  preview: {
    prepare() {
      return {
        title: 'Booking Section',
      }
    }
  }
})

