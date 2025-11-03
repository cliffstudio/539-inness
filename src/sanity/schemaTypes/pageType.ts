import { defineType, defineField } from 'sanity'
import { DocumentTextIcon } from '@sanity/icons'
import { imageSizeValidation } from './utils/imageValidation'
import { videoSizeValidation } from './utils/videoValidation'

export const pageType = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  icon: DocumentTextIcon,
  fieldsets: [
    {
      name: 'heroSection',
      title: 'Hero Section',
    },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
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
      name: 'pageType',
      title: 'Page Type',
      type: 'string',
      options: {
        list: [
          { title: 'Homepage', value: 'homepage' },
          { title: 'General Page', value: 'general' },
        ],
      },
    }),

    // Homepage specific fields
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      fieldset: 'heroSection',
      hidden: ({ parent }) => parent?.pageType !== 'homepage',
    }),
    defineField({
      name: 'mediaType',
      title: 'Media Type',
      type: 'string',
      initialValue: 'image',
      options: { list: ['image','video'] },
      fieldset: 'heroSection',
      hidden: ({ parent }) => parent?.pageType !== 'homepage',
    }),
    defineField({ 
      name: 'image',
      title: 'Image',
      type: 'image',
      fieldset: 'heroSection',
      hidden: ({ parent }) => parent?.pageType !== 'homepage' || parent?.mediaType !== 'image',
      validation: imageSizeValidation,
    }),
    defineField({ 
      name: 'video', 
      title: 'Video',
      type: 'file', 
      options: { 
        accept: 'video/mp4,.mp4' 
      },
      fieldset: 'heroSection',
      hidden: ({ parent }) => parent?.pageType !== 'homepage' || parent?.mediaType !== 'video',
      validation: videoSizeValidation,
    }),
    defineField({
      name: 'videoPlaceholder',
      title: 'Video Placeholder',
      type: 'image',
      fieldset: 'heroSection',
      hidden: ({ parent }) => parent?.pageType !== 'homepage' || parent?.mediaType !== 'video',
      validation: imageSizeValidation,
    }),

    // Flexible content blocks
    defineField({
      name: 'contentBlocks',
      title: 'Content Blocks',
      type: 'flexibleContent',
      description: 'Add and arrange content blocks to build your page',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      pageType: 'pageType',
    },
    prepare({ title }) {
      return {
        title: title || 'Untitled Page',
      }
    },
  },
})
