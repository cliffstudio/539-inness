// /schemas/objects/link.ts
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'link',
  title: 'Link',
  type: 'object',
  fields: [
    defineField({
      name: 'linkType',
      title: 'Link Type',
      type: 'string',
      initialValue: 'internal',
      options: { 
        list: ['internal','external', 'jump', 'file', 'booking'] 
      }
    }),
    defineField({ 
      name: 'label',
      title: 'Label',
      type: 'string',
      description: 'Optional: If left empty, the page title will be used for internal links',
    }),
    defineField({ 
      name: 'href',
      title: 'Href',
      type: 'url',
      hidden: ({ parent }) => parent?.linkType !== 'external'
    }),
    defineField({
      name: 'pageLink',
      title: 'Page Link',
      type: 'reference',
      to: [{ type: 'page' }],
      hidden: ({ parent }) => parent?.linkType === 'external' || parent?.linkType === 'jump' || parent?.linkType === 'file' || parent?.linkType === 'booking'
    }),
    defineField({
      name: 'jumpLink',
      title: 'Jump Link',
      type: 'string',
      description: 'The ID of the element to jump to eg. cabin',
      hidden: ({ parent }) => parent?.linkType !== 'jump'
    }),
    defineField({
      name: 'file',
      title: 'File',
      type: 'file',
      description: 'Upload a file to link to',
      hidden: ({ parent }) => parent?.linkType !== 'file'
    }),
    defineField({
      name: 'bookingTab',
      title: 'Booking Tab',
      type: 'string',
      description: 'Select which booking tab to open',
      options: {
      list: [
        { title: 'Book a Room', value: 'room' },
        { title: 'Book a Table', value: 'table' },
        { title: 'Book a Tee Time', value: 'golf' },
        { title: 'Spa enquiries', value: 'spa' },
        { title: 'Book Activity', value: 'activity' },
      ],
      },
      initialValue: 'room',
      hidden: ({ parent }) => parent?.linkType !== 'booking'
    }),
    defineField({
      name: 'color',
      title: 'Button Color',
      type: 'string',
      options: {
        list: [
          { title: 'Cream', value: 'cream' },
          { title: 'Orange', value: 'orange' },
          { title: 'Outline', value: 'outline' },
        ],
      },
      initialValue: 'cream',
    }),
  ],
  preview: {
    select: {
      linkType: 'linkType',
      url: 'href',
      label: 'label',
      pageTitle: 'pageLink.title',
      jumpLink: 'jumpLink',
      fileName: 'file.asset.originalFilename',
      bookingTab: 'bookingTab',
    },
    prepare({ linkType, url, label, pageTitle, jumpLink, fileName, bookingTab }) {
      let title = ''
      let subtitle = ''
      
      if (linkType === 'external') {
        title = label || 'External Link'
        subtitle = url || 'No URL'
      } else if (linkType === 'jump') {
        title = label || 'Jump Link'
        subtitle = jumpLink || 'No Jump Link'
      } else if (linkType === 'file') {
        title = label || 'File Link'
        subtitle = fileName || 'No File Selected'
      } else if (linkType === 'booking') {
        const tabLabels: Record<string, string> = {
          'room': 'Book a Room',
          'table': 'Book a Table',
          'golf': 'Book a Tee Time',
          'spa': 'Spa enquiries',
          'activity': 'Book Activity',
        }
        title = label || 'Booking Link'
        subtitle = tabLabels[bookingTab] || bookingTab || 'No Tab Selected'
      } else {
        title = label || 'Internal Link'
        subtitle = pageTitle || 'No Page Selected'
      }
      
      return {
        title,
        subtitle,
      }
    }
  }
})
