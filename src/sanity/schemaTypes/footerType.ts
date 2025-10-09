import { defineType, defineField } from 'sanity'

export const footerType = defineType({
  name: 'footer',
  title: 'Footer',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Footer Title',
      type: 'string',
    }),
    defineField({
      name: 'footerItems',
      title: 'Footer Items',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ 
              name: 'heading',
              type: 'string' 
            }),
            defineField({ 
              name: 'text', 
              type: 'richPortableText' 
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'socialLinks',
      type: 'object',
      fields: [
        defineField({
          name: 'heading',
          type: 'string',
        }),
        defineField({
          name: 'links',
          type: 'array',
          of: [{ type: 'link' }],
        }),
      ],
    }),
    defineField({
      name: 'footerNav',
      title: 'Footer Navigation',
      type: 'array',
      of: [{ type: 'link' }],
    }),
  ],
})
