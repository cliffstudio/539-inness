import { ALL_FIELDS_GROUP, defineField } from 'sanity'
import { CogIcon } from '@sanity/icons'

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
