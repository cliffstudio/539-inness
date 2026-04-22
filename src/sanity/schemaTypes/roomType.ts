import { defineType, defineField, ALL_FIELDS_GROUP } from 'sanity'
import { HomeIcon } from '@sanity/icons'

export const roomType = defineType({
  name: 'room',
  title: 'Room',
  type: 'document',
  icon: HomeIcon,
  groups: [
    {
      ...ALL_FIELDS_GROUP,
      hidden: true,
    },
    {
      name: 'content',
      title: 'Content',
    },
    {
      name: 'seo',
      title: 'SEO',
    }
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      group: 'content',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
      },
      validation: (Rule) => Rule.required(),
      group: 'content',
    }),
    defineField({
      name: 'roomType',
      title: 'Room Type',
      type: 'string',
      options: {
        list: [
          { title: 'Cabin', value: 'cabin' },
          { title: 'Farmhouse', value: 'farmhouse' },
        ],
      },
      initialValue: 'cabin',
      group: 'content',
    }),
    defineField({ 
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [{ 
        type: 'image',
        options: {
          hotspot: true,
        },
      }],
      group: 'content',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [{ type: 'block' }],
      group: 'content',
    }),
    defineField({
      name: 'specs',
      title: 'Specs',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'body',
              title: 'Body',
              type: 'string',
            },
          ],
        },
      ],
      group: 'content',
    }),
    defineField({
      name: 'contentBlocks',
      title: 'Content Blocks',
      type: 'flexibleContent',
      group: 'content',
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
      group: 'seo',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      images: 'images',
    },
    prepare(selection) {
      const { title, images } = selection
      return {
        title,
        media: images?.[0],
      }
    },
  },
  orderings: [
    {
      title: 'Title A-Z',
      name: 'titleAsc',
      by: [
        { field: 'title', direction: 'asc' }
      ]
    }
  ]
})
