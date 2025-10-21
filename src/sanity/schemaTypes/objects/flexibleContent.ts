import { defineType } from 'sanity'

export default defineType({
  name: 'flexibleContent',
  title: 'Content Blocks',
  type: 'array',
  of: [
    {
      type: 'heroSection',
      title: 'Hero Section'
    }
  ],
  validation: (Rule) => Rule.max(20).error('Maximum 20 content blocks allowed'),
  options: {
    sortable: true,
  }
})
