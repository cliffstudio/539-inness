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
    },
    prepare({ products }) {
      const productCount = products?.length || 0
      return {
        title: 'Product Section',
        subtitle: `${productCount} ${productCount === 1 ? 'product' : 'products'}`,
      }
    }
  }
})
