import { defineType, defineField } from 'sanity'
import { imageSizeValidation } from './utils/imageValidation'

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
    defineField({
      name: 'announcementPopup',
      title: 'Announcement Pop Up',
      type: 'object',
      fields: [
        defineField({
          name: 'enabled',
          title: 'Enable Pop Up',
          type: 'boolean',
          initialValue: true,
          description: 'Toggle to show or hide the announcement popup on all pages',
        }),
        defineField({
          name: 'slides',
          title: 'Slides',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                defineField({
                  name: 'image',
                  title: 'Image',
                  type: 'image',
                  description: 'Maximum file size: 500KB.',
                  validation: imageSizeValidation,
                }),
                defineField({
                  name: 'title',
                  title: 'Title',
                  type: 'string',
                }),
                defineField({
                  name: 'text',
                  title: 'Text',
                  type: 'text',
                }),
                defineField({
                  name: 'button',
                  title: 'Button',
                  type: 'link',
                }),
              ],
              preview: {
                select: {
                  title: 'title',
                  media: 'image',
                },
                prepare({ title, media }) {
                  return {
                    title: title || 'Untitled Slide',
                    media,
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
