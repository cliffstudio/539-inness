import { ALL_FIELDS_GROUP, defineField } from 'sanity'
import { ArrowTopRightIcon, CogIcon, LinkIcon } from '@sanity/icons'

export const siteSettingsType = {
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  icon: CogIcon,
  groups: [
    {
      ...ALL_FIELDS_GROUP,
      hidden: true,
    },
    {
      name: 'seo',
      title: 'SEO',
    },
    {
      name: 'header',
      title: 'Header',
    },
    {
      name: 'footer',
      title: 'Footer',
    },
    {
      name: 'announcementPopup',
      title: 'Announcement Popup',
    },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Title used for search engines and browsers.',
      group: 'seo',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      description: 'Description used for search engines.',
      group: 'seo',
    }),
    defineField({
      name: 'socialimage',
      title: 'Social Image',
      type: 'image',
      description: 'Image used for social media previews. Recommended size: 1200×630px.',
      group: 'seo',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.custom(async (file, context): Promise<true | string> => {
        if (!file?.asset?._ref) return true
        
        try {
          const client = context.getClient({ apiVersion: '2025-05-08' })
          await client.fetch('*[_id == $id][0]', { id: file.asset._ref })
        } catch {
          // If we can't fetch the asset yet (e.g., during upload), skip validation
        }
        return true
      }),
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
                media: ArrowTopRightIcon,
              }
            }
            return {
              title: label || pageTitle || 'Untitled',
              media: LinkIcon,
            }
          },
        },
      },
      ],
      group: 'header',
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
      group: 'footer',
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
      group: 'footer',
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
      group: 'footer',
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
      group: 'footer',
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
                  options: {
                    hotspot: true,
                  },
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
      group: 'announcementPopup',
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Site Settings',
        media: CogIcon,
      }
    },
  },
}
