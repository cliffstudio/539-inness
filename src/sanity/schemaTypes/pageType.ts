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
    {
      name: 'linksSection',
      title: 'Links Section',
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
          { title: 'Activities Page', value: 'activities' },
          { title: 'Links Page', value: 'links' },
        ],
      },
    }),

    // Homepage specific fields
    defineField({
      name: 'homepageHeading',
      title: 'Heading',
      type: 'string',
      fieldset: 'heroSection',
      hidden: ({ parent }) => parent?.pageType !== 'homepage',
    }),
    defineField({
      name: 'homepageMediaType',
      title: 'Media Type',
      type: 'string',
      initialValue: 'image',
      options: { list: ['image','video'] },
      fieldset: 'heroSection',
      hidden: ({ parent }) => parent?.pageType !== 'homepage',
    }),
    defineField({ 
      name: 'homepageImage',
      title: 'Image',
      type: 'image',
      description: 'Maximum file size: 500KB.',
      fieldset: 'heroSection',
      hidden: ({ parent }) => parent?.pageType !== 'homepage' || parent?.homepageMediaType !== 'image',
      validation: imageSizeValidation,
    }),
    defineField({ 
      name: 'homepageVideo', 
      title: 'Video',
      description: 'Only MP4 files are accepted. Maximum file size: 10MB.',
      type: 'file', 
      options: { 
        accept: 'video/mp4,.mp4' 
      },
      fieldset: 'heroSection',
      hidden: ({ parent }) => parent?.pageType !== 'homepage' || parent?.homepageMediaType !== 'video',
      validation: videoSizeValidation,
    }),
    defineField({
      name: 'homepageVideoPlaceholder',
      title: 'Video Placeholder',
      type: 'image',
      description: 'Maximum file size: 500KB.',
      fieldset: 'heroSection',
      hidden: ({ parent }) => parent?.pageType !== 'homepage' || parent?.homepageMediaType !== 'video',
      validation: imageSizeValidation,
    }),

    // Activities specific fields
    defineField({
      name: 'activitiesHeading',
      title: 'Heading',
      type: 'string',
      fieldset: 'heroSection',
      hidden: ({ parent }) => parent?.pageType !== 'activities',
    }),
    defineField({
      name: 'activitiesBody',
      title: 'Body',
      type: 'array',
      of: [{ type: 'block' }],
      fieldset: 'heroSection',
      hidden: ({ parent }) => parent?.pageType !== 'activities',
    }),
    defineField({ 
      name: 'activitiesImage',
      title: 'Image',
      type: 'image',
      description: 'Maximum file size: 500KB.',
      fieldset: 'heroSection',
      hidden: ({ parent }) => parent?.pageType !== 'activities',
      validation: imageSizeValidation,
    }),

    // Flexible content blocks
    defineField({
      name: 'contentBlocks',
      title: 'Content Blocks',
      type: 'flexibleContent',
      description: 'Add and arrange content blocks to build your page',
      hidden: ({ parent }) => parent?.pageType === 'activities' || parent?.pageType === 'links',
    }),

    // Links specific fields
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      fieldset: 'heroSection',
      hidden: ({ parent }) => parent?.pageType !== 'links',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [{ type: 'block' }],
      fieldset: 'heroSection',
      hidden: ({ parent }) => parent?.pageType !== 'links',
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      description: 'Maximum file size: 500KB.',
      fieldset: 'heroSection',
      hidden: ({ parent }) => parent?.pageType !== 'links',
      validation: imageSizeValidation,
    }),
    defineField({
      name: 'links',
      title: 'Links',
      type: 'array',
      of: [{ type: 'detailedLink' }],
      fieldset: 'linksSection',
      hidden: ({ parent }) => parent?.pageType !== 'links',
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
