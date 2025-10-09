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
      hidden: ({ parent }) => parent?.linkType !== 'external'
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
      description: 'The ID of the element to jump to eg. #spaces',
      hidden: ({ parent }) => parent?.linkType !== 'jump'
    }),
  ]
})
