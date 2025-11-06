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
      name: 'navigationColumn1',
      title: 'Navigation Column 1',
      type: 'object',
      fields: [
        defineField({
          name: 'heading',
          title: 'Column Heading',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'links',
          title: 'Links',
          type: 'array',
          of: [{ type: 'footerLink' }],
        }),
      ],
    }),
    defineField({
      name: 'navigationColumn2',
      title: 'Navigation Column 2',
      type: 'object',
      fields: [
        defineField({
          name: 'heading',
          title: 'Column Heading',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'links',
          title: 'Links',
          type: 'array',
          of: [{ type: 'footerLink' }],
        }),
      ],
    }),
    defineField({
      name: 'followColumn',
      title: 'Follow Column',
      type: 'object',
      fields: [
        defineField({
          name: 'heading',
          title: 'Heading',
          type: 'string',
          initialValue: 'Follow',
        }),
        defineField({
          name: 'links',
          title: 'Social Links',
          type: 'array',
          of: [{ type: 'footerLink' }],
        }),
      ],
    }),
    defineField({
      name: 'contactColumn',
      title: 'Contact Column',
      type: 'object',
      fields: [
        defineField({
          name: 'heading',
          title: 'Heading',
          type: 'string',
          initialValue: 'Contact',
        }),
        defineField({
          name: 'contactItems',
          title: 'Contact Items',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                defineField({
                  name: 'label',
                  title: 'Label',
                  type: 'string',
                  description: 'e.g., "Front Desk", "Restaurant", "Spa"',
                  validation: (Rule) => Rule.required(),
                }),
                defineField({
                  name: 'phoneNumber',
                  title: 'Phone Number',
                  type: 'string',
                  description: 'e.g., "845-377-0030"',
                  validation: (Rule) => Rule.required(),
                }),
                defineField({
                  name: 'extension',
                  title: 'Extension',
                  type: 'string',
                  description: 'e.g., "x0", "x2", "x132" (optional)',
                }),
              ],
              preview: {
                select: {
                  label: 'label',
                  phone: 'phoneNumber',
                  ext: 'extension',
                },
                prepare({ label, phone, ext }) {
                  return {
                    title: label || 'Untitled Contact',
                    subtitle: phone ? `${phone}${ext ? ` ${ext}` : ''}` : 'No phone number',
                  }
                },
              },
            },
          ],
        }),
      ],
    }),
  ],
})
