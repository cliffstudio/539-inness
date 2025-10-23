import { defineType } from 'sanity'

export default defineType({
  name: 'flexibleContent',
  title: 'Content Blocks',
  type: 'array',
  of: [
    {
      type: 'heroSection',
      title: 'Hero Section'
    },
    {
      type: 'mediaTextSection',
      title: 'Media & Text Section'
    },
    {
      type: 'breakSection',
      title: 'Break Section'
    },
    {
      type: 'carouselSection',
      title: 'Carousel Section'
    }
  ],
  options: {
    sortable: true,
  }
})
