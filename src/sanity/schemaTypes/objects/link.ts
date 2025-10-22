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
        list: ['internal','external', 'jump'] 
      }
    }),
    defineField({ 
      name: 'label',
      title: 'Label',
      type: 'string',
      hidden: ({ parent }) => parent?.linkType !== 'external' && parent?.linkType !== 'jump'
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
      hidden: ({ parent }) => parent?.linkType === 'external' || parent?.linkType === 'jump'
    }),
    defineField({
      name: 'jumpLink',
      title: 'Jump Link',
      type: 'string',
      description: 'The ID of the element to jump to eg. cabin',
      hidden: ({ parent }) => parent?.linkType !== 'jump'
    }),
  ],
  preview: {
    select: {
      linkType: 'linkType',
      url: 'href',
      label: 'label',
      pageTitle: 'pageLink.title',
      jumpLink: 'jumpLink',
    },
    prepare({ linkType, url, pageTitle, jumpLink }) {
      let subtitle = ''
      
      if (linkType === 'external') {
        subtitle = url || 'No URL'
      } else if (linkType === 'jump') {
        subtitle = jumpLink || 'No Jump Link'
      } else {
        subtitle = pageTitle || 'No Page Selected'
      }
      
      return {
        title: linkType === 'external' ? 'External Link' : linkType === 'jump' ? 'Jump Link' : 'Internal Link',
        subtitle,
      }
    }
  }
})
