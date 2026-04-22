import { defineType, defineField } from 'sanity'

export default defineType({
  title: 'SEO',
  name: 'seo',
  type: 'object',
  fields: [
    defineField({
      type: 'string',
      title: 'Title',
      name: 'metaTitle',
      description: 'Title used for search engines and browsers.',
      validation: Rule => Rule.max(50).warning('Longer titles may be truncated by search engines')
    }),
    defineField({
      type: 'text',
      title: 'Description',
      name: 'metaDescription',
      rows: 3,
      description: 'Description used for search engines.',
      validation: Rule => Rule.max(150).warning('Longer descriptions may be truncated by search engines')
    }),
    defineField({
      name: 'socialImage',
      title: 'Social Image',
      type: 'image',
      description: 'Image used for social media previews. Recommended size: 1200×630px.',
      hidden: ({ document }) => document?._type === 'calendar' || document?._type === 'product',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.custom(async (file, context): Promise<true | string> => {
        if (!file?.asset?._ref) return true
        
        try {
          const client = context.getClient({ apiVersion: '2025-05-08' })
          await client.fetch('*[_id == $id][0]', { id: file.asset._ref })
        } catch {
          return 'Unable to validate selected image asset.'
        }
        
        return true
      }),
    }),
    defineField({
      type: 'url',
      title: 'Social Image URL',
      name: 'socialImageUrl',
      description: 'Image used for social media previews.',
      hidden: ({ document }) => document?._type !== 'calendar' && document?._type !== 'product',
    }),
  ]
})