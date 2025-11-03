import { defineType, defineField } from 'sanity'
import { imageSizeValidation } from '../utils/imageValidation'

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
        validation: imageSizeValidation,
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
