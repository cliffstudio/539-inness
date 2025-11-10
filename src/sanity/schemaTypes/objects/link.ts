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
        list: ['internal','external', 'jump', 'file'] 
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
      hidden: ({ parent }) => parent?.linkType === 'external' || parent?.linkType === 'jump' || parent?.linkType === 'file'
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
    },
    prepare({ linkType, url, label, pageTitle, jumpLink, fileName }) {
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
