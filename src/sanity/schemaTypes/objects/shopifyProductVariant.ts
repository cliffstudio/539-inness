import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'shopifyProductVariant',
  title: 'Shopify',
  type: 'object',
  fieldsets: [
    {
      name: 'options',
      title: 'Options',
      options: {
        columns: 3,
      },
    },
    {
      name: 'status',
      title: 'Status',
    },
  ],
  fields: [
    defineField({
      fieldset: 'status',
      name: 'createdAt',
      title: 'Created at',
      type: 'string',
    }),
    defineField({
      fieldset: 'status',
      name: 'updatedAt',
      title: 'Updated at',
      type: 'string',
    }),
    defineField({
      fieldset: 'status',
      name: 'status',
      title: 'Product status',
      type: 'string',
      options: {
        layout: 'dropdown',
        list: ['active', 'archived', 'draft'],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      fieldset: 'status',
      name: 'isDeleted',
      title: 'Deleted from Shopify?',
      type: 'boolean',
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'sku',
      title: 'SKU',
      type: 'string',
    }),
    defineField({
      name: 'id',
      title: 'ID',
      type: 'number',
      description: 'Shopify Product Variant ID',
    }),
    defineField({
      name: 'gid',
      title: 'GID',
      type: 'string',
      description: 'Shopify Product Variant GID',
    }),
    defineField({
      name: 'productId',
      title: 'Product ID',
      type: 'number',
    }),
    defineField({
      name: 'productGid',
      title: 'Product GID',
      type: 'string',
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'number',
    }),
    defineField({
      name: 'compareAtPrice',
      title: 'Compare at price',
      type: 'number',
    }),
    defineField({
      name: 'inventory',
      title: 'Inventory',
      type: 'inventory',
    }),
    defineField({
      fieldset: 'options',
      name: 'option1',
      title: 'Option 1',
      type: 'string',
    }),
    defineField({
      fieldset: 'options',
      name: 'option2',
      title: 'Option 2',
      type: 'string',
    }),
    defineField({
      fieldset: 'options',
      name: 'option3',
      title: 'Option 3',
      type: 'string',
    }),
    defineField({
      name: 'previewImageUrl',
      title: 'Preview Image URL',
      type: 'string',
      description: 'Image displayed in both cart and checkout',
    }),
    defineField({
      name: 'colorHex',
      title: 'Color Hex',
      type: 'string',
      description: 'Hexadecimal color code',
    }),
    defineField({
      name: 'shop',
      title: 'Shop',
      type: 'object',
      description: 'Shopify Shop details',
      fields: [
        defineField({
          name: 'domain',
          title: 'Domain',
          type: 'string',
        }),
      ],
    }),
  ],
  readOnly: true,
})
