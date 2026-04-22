import { defineType, defineField, ALL_FIELDS_GROUP } from 'sanity'
import { DocumentTextIcon, TextIcon } from '@sanity/icons'

export const pageType = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  icon: DocumentTextIcon,
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
      group: 'content',
    }),
    defineField({
      name: 'pageType',
      title: 'Page Type',
      type: 'string',
      options: {
        list: [
          { title: 'Homepage', value: 'homepage' },
          { title: 'General Page', value: 'general' },
          { title: 'Calendar Page', value: 'calendar' },
          { title: 'Links Page', value: 'links' },
          { title: 'Text Page', value: 'text' },
        ],
      },
      group: 'content',
    }),

    // Homepage specific fields
    defineField({
      name: 'homepageHeading',
      title: 'Heading',
      type: 'string',
      fieldset: 'heroSection',
      hidden: ({ parent }) => parent?.pageType !== 'homepage',
      group: 'content',
    }),
    defineField({
      name: 'homepageMediaType',
      title: 'Media Type',
      type: 'string',
      initialValue: 'image',
      options: { list: ['image','video'] },
      fieldset: 'heroSection',
      hidden: ({ parent }) => parent?.pageType !== 'homepage',
      group: 'content',
    }),
    defineField({ 
      name: 'homepageImages',
      title: 'Images',
      type: 'array',
      fieldset: 'heroSection',
      of: [{ 
        type: 'image',
        options: {
          hotspot: true,
        },
      }],
      hidden: ({ parent }) => parent?.pageType !== 'homepage' || parent?.homepageMediaType !== 'image',
      group: 'content',
    }),
    defineField({
      name: 'homepageVideo',
      title: 'Video',
      type: 'bunnyVideo',
      fieldset: 'heroSection',
      hidden: ({ parent }) => parent?.pageType !== 'homepage' || parent?.homepageMediaType !== 'video',
      group: 'content',
    }),

    // Calendar specific fields
    defineField({
      name: 'calendarHeading',
      title: 'Heading',
      type: 'string',
      fieldset: 'heroSection',
      hidden: ({ parent }) => parent?.pageType !== 'calendar',
      group: 'content',
    }),
    defineField({
      name: 'calendarBody',
      title: 'Body',
      type: 'array',
      of: [{ type: 'block' }],
      fieldset: 'heroSection',
      hidden: ({ parent }) => parent?.pageType !== 'calendar',
      group: 'content',
    }),
    defineField({
      name: 'calendarMediaType',
      title: 'Media Type',
      type: 'string',
      initialValue: 'image',
      options: { list: ['image','video'] },
      fieldset: 'heroSection',
      hidden: ({ parent }) => parent?.pageType !== 'calendar',
      group: 'content',
    }),
    defineField({ 
      name: 'calendarImages',
      title: 'Images',
      type: 'array',
      fieldset: 'heroSection',
      hidden: ({ parent }) => parent?.pageType !== 'calendar' || parent?.calendarMediaType !== 'image',
      of: [{ 
        type: 'image',
        options: {
          hotspot: true,
        },
      }],
      group: 'content',
    }),
    defineField({
      name: 'calendarVideo',
      title: 'Video',
      type: 'bunnyVideo',
      fieldset: 'heroSection',
      hidden: ({ parent }) => parent?.pageType !== 'calendar' || parent?.calendarMediaType !== 'video',
      group: 'content',
    }),

    // Flexible content blocks
    defineField({
      name: 'contentBlocks',
      title: 'Content Blocks',
      type: 'flexibleContent',
      description: 'Add and arrange content blocks to build your page',
      hidden: ({ parent }) => parent?.pageType === 'calendar' || parent?.pageType === 'links' || parent?.pageType === 'text',
      group: 'content',
    }),

    // Links specific fields
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      fieldset: 'heroSection',
      hidden: ({ parent }) => parent?.pageType !== 'links',
      group: 'content',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [{ type: 'block' }],
      fieldset: 'heroSection',
      hidden: ({ parent }) => parent?.pageType !== 'links',
      group: 'content',
    }),
    defineField({
      name: 'mediaType',
      title: 'Media Type',
      type: 'string',
      initialValue: 'image',
      options: { list: ['image','video'] },
      fieldset: 'heroSection',
      hidden: ({ parent }) => parent?.pageType !== 'links',
      group: 'content',
    }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      fieldset: 'heroSection',
      hidden: ({ parent }) => parent?.pageType !== 'links' || parent?.mediaType !== 'image',
      of: [{ 
        type: 'image',
        options: {
          hotspot: true,
        },
      }],
      group: 'content',
    }),
    defineField({
      name: 'video',
      title: 'Video',
      type: 'bunnyVideo',
      fieldset: 'heroSection',
      hidden: ({ parent }) => parent?.pageType !== 'links' || parent?.mediaType !== 'video',
      group: 'content',
    }),
    defineField({
      name: 'links',
      title: 'Links',
      type: 'array',
      of: [{ type: 'detailedLink' }],
      options: {
        sortable: false,
      },
      fieldset: 'linksSection',
      hidden: ({ parent }) => parent?.pageType !== 'links',
      group: 'content',
    }),

    // Text specific fields
    defineField({
      name: 'textBlocks',
      title: 'Text Blocks',
      type: 'array',
      of: [{ 
        type: 'object',
        name: 'textBlock',
        fields: [
          {
            name: 'header',
            title: 'Header',
            type: 'string',
          },
          {
            name: 'body',
            title: 'Body',
            type: 'array',
            of: [{ type: 'block' }],
          },
        ],
        preview: {
          select: {
            header: 'header',
            body: 'body',
          },
          prepare({ header, body }) {
            return {
              title: header || 'Untitled Text Block',
              // subtitle: body?.[0]?.children?.[0]?.text || 'No Body',
              media: TextIcon,
            }
          },
        },
      }],
      hidden: ({ parent }) => parent?.pageType !== 'text',
      group: 'content',
    }),

    // SEO specific fields
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
      description: 'Override title, description and social image for search results and social shares. Empty = use site settings.',
      group: 'seo',
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
