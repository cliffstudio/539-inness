import { defineType, defineField } from 'sanity'
import { HomeIcon } from '@sanity/icons'
import { imageSizeValidation } from './utils/imageValidation'

export const roomType = defineType({
  name: 'room',
  title: 'Room',
  type: 'document',
  icon: HomeIcon,
  fieldsets: [
    {
      name: 'heroSection',
      title: 'Hero Section',
    }
  ],
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
    }),
    // defineField({
    //   name: 'image',
    //   title: 'Image',
    //   type: 'image',
    //   description: 'Maximum file size: 500KB.',
    //   fieldset: 'heroSection',
    //   validation: imageSizeValidation,
    // }),
    defineField({ 
      name: 'images',
      title: 'Images',
      type: 'array',
      description: 'Maximum file size per image: 500KB.',
      of: [{ 
        type: 'image',
        validation: imageSizeValidation,
      }],
      fieldset: 'heroSection',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [{ type: 'block' }],
      fieldset: 'heroSection',
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
      fieldset: 'heroSection',
    }),
    defineField({
      name: 'contentBlocks',
      title: 'Content Blocks',
      type: 'flexibleContent',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'image',
    },
    prepare(selection) {
      const { title, media } = selection
      return {
        title,
        media,
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
