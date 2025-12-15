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
            name: 'linkType',
            title: 'Link Type',
            type: 'string',
            initialValue: 'internal',
            options: { 
              list: ['internal', 'external']
            }
          }),
          defineField({
            name: 'label',
            title: 'Label',
            type: 'string',
            description: 'Optional custom label for this menu item. If left empty, the page title will be used for internal links.',
          }),
          defineField({
            name: 'href',
            title: 'External URL',
            type: 'url',
            description: 'The external URL to link to',
            hidden: ({ parent }) => parent?.linkType !== 'external'
          }),
          defineField({
            name: 'pageLink',
            title: 'Page Link',
            type: 'reference',
            to: [{ type: 'page' }],
            hidden: ({ parent }) => parent?.linkType === 'external'
          }),
        ],
        preview: {
          select: {
            linkType: 'linkType',
            label: 'label',
            pageTitle: 'pageLink.title',
            href: 'href',
          },
          prepare(selection) {
            const { linkType, label, pageTitle, href } = selection
            if (linkType === 'external') {
              return {
                title: label || 'External Link',
                subtitle: href || 'No URL',
              }
            }
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