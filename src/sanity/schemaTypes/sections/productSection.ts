import React from 'react'
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'productSection',
  title: 'Product Section',
  type: 'object',
  fields: [
    defineField({
      name: 'id',
      title: 'ID',
      type: 'string',
    }),
    defineField({
      name: 'hide',
      title: 'Hide Section',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'products',
      title: 'Products',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'product' }],
        },
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  preview: {
    select: {
      products: 'products',
      firstProductImageUrl: 'products.0.store.previewImageUrl',
    },
    prepare({ products, firstProductImageUrl }) {
      const productCount = products?.length || 0
      return {
        title: 'Product Section',
        // subtitle: `${productCount} ${productCount === 1 ? 'product' : 'products'}`,
        media: firstProductImageUrl
          ? React.createElement('img', {
              src: firstProductImageUrl,
              alt: 'First product',
              style: { objectFit: 'cover' },
            })
          : undefined,
      }
    }
  }
})
