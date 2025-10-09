import { defineType, defineField } from 'sanity'
import { BellIcon } from '@sanity/icons'

export const pressType = defineType({
  name: 'press',
  title: 'Press',
  type: 'document',
  icon: BellIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published Date',
      type: 'date',
      options: {
        dateFormat: 'DD/MM/YYYY',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'thumbnailType',
      title: 'Thumbnail Type',
      type: 'string',
      options: {
        list: [
          { title: 'Image', value: 'image' },
          { title: 'Logo', value: 'logo' }
        ]
      }
    }),
    defineField({
      name: 'thumbnailImage',
      title: 'Thumbnail Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      hidden: ({ parent }) => parent?.thumbnailType !== 'image'
    }),
    defineField({
      name: 'thumbnailLogo',
      title: 'Thumbnail Logo',
      type: 'image',
      hidden: ({ parent }) => parent?.thumbnailType !== 'logo'
    }),
    defineField({
      name: 'thumbnailBackgroundColour',
      title: 'Thumbnail Background Colour',
      type: 'string',
      initialValue: '#581B25',
      options: { 
        list: [
          { title: 'Burgundy', value: '#581B25' },
          { title: 'Tan', value: '#E6D3C3' },
          { title: 'Light Purple', value: '#E3DDE7' },
          { title: 'Green', value: '#C4C7B2' },
        ]
      },
      hidden: ({ parent }) => parent?.thumbnailType !== 'logo'
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.max(200),
    }),
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'richPortableText',
    }),
    defineField({
      name: 'source',
      title: 'Source',
      type: 'string',
    }),
    defineField({
      name: 'sourceUrl',
      title: 'Source URL',
      type: 'url',
      description: 'Link to the original article',
    }),
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      options: {
        list: [
          { title: 'Layout 1', value: 'layout-1' },
          { title: 'Layout 2', value: 'layout-2' }
        ]
      }
    }),
  ],
  preview: {
    select: {
      title: 'title',
      source: 'source',
      media: 'featuredImage',
      publishedAt: 'publishedAt',
    },
    prepare(selection) {
      const { title, source, media, publishedAt } = selection
      const date = publishedAt ? new Date(publishedAt).toLocaleDateString() : ''
      return {
        title,
        subtitle: `${source} • ${date ? date : ''}`,
        media,
      }
    },
  },
  orderings: [
    {
      title: 'Published Date, New',
      name: 'publishedAtDesc',
      by: [
        { field: 'publishedAt', direction: 'desc' }
      ]
    },
    {
      title: 'Published Date, Old',
      name: 'publishedAtAsc',
      by: [
        { field: 'publishedAt', direction: 'asc' }
      ]
    },
    {
      title: 'Title A-Z',
      name: 'titleAsc',
      by: [
        { field: 'title', direction: 'asc' }
      ]
    }
  ]
})
