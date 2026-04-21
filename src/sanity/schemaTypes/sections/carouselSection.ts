import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'carouselSection',
  title: 'Carousel Section',
  type: 'object',
  fields: [
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
    }),
  ],
  preview: {
    select: {
      media: 'images',
    },
    prepare({ media }) {
      return {
        title: 'Carousel Section',
        media: media?.[0]
      }
    }
  }
})
