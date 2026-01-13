import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'inventory',
  title: 'Inventory',
  type: 'object',
  fields: [
    defineField({
      name: 'available',
      title: 'Available',
      type: 'number',
    }),
    defineField({
      name: 'isAvailable',
      title: 'Is available',
      type: 'boolean',
    }),
    defineField({
      name: 'management',
      title: 'Management',
      type: 'string',
    }),
    defineField({
      name: 'policy',
      title: 'Policy',
      type: 'string',
    }),
  ],
})
