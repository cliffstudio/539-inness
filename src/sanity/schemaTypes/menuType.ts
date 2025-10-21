import { defineType, defineField } from 'sanity'

export const menuType = defineType({
  name: 'menu',
  title: 'Menu',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Menu Title',
      type: 'string',
    }),
    defineField({
      name: 'items',
      title: 'Menu Items',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'pageLink',
              type: 'reference',
              to: [{ type: 'page' }],
            }),
          ],
          preview: {
            select: {
              title: 'pageLink.title',
            },
            prepare(selection) {
              const { title } = selection
              return {
                title: title || 'Untitled',
              }
            },
          },
        },
      ],
    }),
  ],
}) 