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
      type: 'textSection',
      title: 'Text Section'
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
    },
    {
      type: 'menuSection',
      title: 'Menu Section'
    },
    {
      type: 'activitySection',
      title: 'Activity Section'
    },
    {
      type: 'featureSection',
      title: 'Feature Section'
    },
    {
      type: 'bookingSection',
      title: 'Booking Section'
    },
    {
      type: 'productSection',
      title: 'Product Section'
    },
  ],
  options: {
    sortable: true,
  }
})
