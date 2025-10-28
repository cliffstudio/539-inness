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
            name: 'label',
            title: 'Label',
            type: 'string',
            description: 'Optional custom label for this menu item. If left empty, the page title will be used.',
          }),
          defineField({
            name: 'pageLink',
            type: 'reference',
            to: [{ type: 'page' }],
          }),
        ],
        preview: {
          select: {
            label: 'label',
            pageTitle: 'pageLink.title',
          },
          prepare(selection) {
            const { label, pageTitle } = selection
            return {
              title: label || pageTitle || 'Untitled',
            }
          },
        },
      },
      ],
    }),
  ],
}) 