import { defineType, defineField } from 'sanity'
import { imageSizeValidation } from '../utils/imageValidation'

export default defineType({
  name: 'menuSection',
  title: 'Menu Section',
  type: 'object',
  fields: [
    defineField({
      name: 'id',
      title: 'ID',
      type: 'string',
    }),
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      options: {
        list: [
          { title: 'Food Menu', value: 'food-menu' },
          { title: 'Spa Menu', value: 'spa-menu' },
          { title: 'Venue Menu', value: 'venue-menu' },
        ],
      },
      initialValue: 'food-menu',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      hidden: ({ parent }) => parent?.layout === 'food-menu' || parent?.layout === 'spa-menu',
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      hidden: ({ parent }) => parent?.layout === 'food-menu' || parent?.layout === 'spa-menu',
      validation: imageSizeValidation,
    }),
    defineField({
      name: 'foodTabs',
      title: 'Food Menu Tabs',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'foodTab',
          title: 'Food Menu Tab',
          fields: [
            defineField({
              name: 'tabName',
              title: 'Tab Name',
              type: 'string',
              description: 'e.g., "Breakfast", "Brunch", "Lunch"',
              validation: Rule => Rule.required(),
            }),
            defineField({
              name: 'availability',
              title: 'Availability',
              type: 'string',
              description: 'e.g., "Saturday - Sunday (8am - 3pm)"',
            }),
            defineField({
              name: 'image',
              title: 'Image',
              type: 'image',
              options: {
                hotspot: true,
              },
              validation: imageSizeValidation,
            }),
            defineField({
              name: 'categories',
              title: 'Categories',
              type: 'array',
              of: [
                {
                  type: 'object',
                  name: 'foodCategory',
                  title: 'Food Category',
                  fields: [
                    defineField({
                      name: 'name',
                      title: 'Category Name',
                      type: 'string',
                      validation: Rule => Rule.required(),
                    }),
                    defineField({
                      name: 'items',
                      title: 'Items',
                      type: 'array',
                      of: [
                        {
                          type: 'object',
                          name: 'menuItem',
                          title: 'Menu Item',
                          fields: [
                            defineField({
                              name: 'name',
                              title: 'Item Name',
                              type: 'string',
                              validation: Rule => Rule.required(),
                            }),
                            defineField({
                              name: 'price',
                              title: 'Price',
                              type: 'number',
                              validation: Rule => Rule.required().min(0),
                            }),
                            defineField({
                              name: 'extras',
                              title: 'Extras',
                              type: 'array',
                              of: [
                                {
                                  type: 'object',
                                  name: 'extra',
                                  title: 'Extra Option',
                                  fields: [
                                    defineField({
                                      name: 'name',
                                      title: 'Extra Name',
                                      type: 'string',
                                    }),
                                    defineField({
                                      name: 'price',
                                      title: 'Price',
                                      type: 'number',
                                    }),
                                  ],
                                },
                              ],
                            }),
                          ],
                          preview: {
                            select: {
                              title: 'name',
                              price: 'price',
                            },
                            prepare({ title, price }) {
                              return {
                                title: title,
                                subtitle: `$${price}`,
                              }
                            },
                          },
                        },
                      ],
                    }),
                  ],
                  preview: {
                    select: {
                      title: 'name',
                      items: 'items',
                    },
                    prepare({ title, items }) {
                      return {
                        title: title || 'Untitled Category',
                        subtitle: `${items?.length || 0} items`,
                      }
                    },
                  },
                },
              ],
            }),
          ],
          preview: {
            select: {
              title: 'tabName',
              image: 'image',
            },
            prepare({ title, image }) {
              return {
                title: title || 'Untitled Tab',
                media: image,
              }
            },
          },
        },
      ],
      hidden: ({ parent }) => parent?.layout !== 'food-menu',
    }),
    defineField({
      name: 'spaTabs',
      title: 'Spa Menu Tabs',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'spaTab',
          title: 'Spa Menu Tab',
          fields: [
            defineField({
              name: 'tabName',
              title: 'Tab Name',
              type: 'string',
              description: 'e.g., "Massages", "Facials", "Wellness"',
              validation: Rule => Rule.required(),
            }),
            defineField({
              name: 'image',
              title: 'Image',
              type: 'image',
              options: {
                hotspot: true,
              },
              validation: imageSizeValidation,
            }),
            defineField({
              name: 'treatments',
              title: 'Treatments',
              type: 'array',
              of: [
                {
                  type: 'object',
                  name: 'spaTreatment',
                  title: 'Spa Treatment',
                  fields: [
                    defineField({
                      name: 'name',
                      title: 'Treatment Name',
                      type: 'string',
                      validation: Rule => Rule.required(),
                    }),
                    defineField({
                      name: 'description',
                      title: 'Description',
                      type: 'richPortableText',
                      validation: Rule => Rule.required(),
                    }),
                    defineField({
                      name: 'options',
                      title: 'Time & Price Options',
                      type: 'array',
                      of: [
                        {
                          type: 'object',
                          name: 'timePrice',
                          title: 'Time & Price',
                          fields: [
                            defineField({
                              name: 'duration',
                              title: 'Duration',
                              type: 'string',
                              description: 'e.g., "60 mins"',
                            }),
                            defineField({
                              name: 'price',
                              title: 'Price',
                              type: 'number',
                              validation: Rule => Rule.min(0),
                            }),
                          ],
                        },
                      ],
                      validation: Rule => Rule.required().min(1),
                    }),
                  ],
                  preview: {
                    select: {
                      title: 'name',
                      price: 'options.0.price',
                    },
                    prepare({ title, price }) {
                      return {
                        title: title,
                        subtitle: price ? `$${price}` : 'No pricing',
                      }
                    },
                  },
                },
              ],
            }),
          ],
          preview: {
            select: {
              title: 'tabName',
              image: 'image',
            },
            prepare({ title, image }) {
              return {
                title: title || 'Untitled Tab',
                media: image,
              }
            },
          },
        },
      ],
      hidden: ({ parent }) => parent?.layout !== 'spa-menu',
    }),
    defineField({
      name: 'venueInfo',
      title: 'Venue Information',
      type: 'object',
      fields: [
        defineField({
          name: 'name',
          title: 'Venue Name',
          type: 'string',
        }),
        defineField({
          name: 'description',
          title: 'Description',
          type: 'text',
        }),
        defineField({
          name: 'details',
          title: 'Venue Details',
          type: 'array',
          of: [
            {
              type: 'object',
              name: 'venueDetail',
              title: 'Detail',
              fields: [
                defineField({
                  name: 'label',
                  title: 'Label',
                  type: 'string',
                  description: 'e.g., "Size", "Capacity"',
                }),
                defineField({
                  name: 'value',
                  title: 'Value',
                  type: 'string',
                }),
              ],
              preview: {
                select: {
                  label: 'label',
                  value: 'value',
                },
                prepare({ label, value }) {
                  return {
                    title: label,
                    subtitle: value,
                  }
                },
              },
            },
          ],
        }),
        defineField({
          name: 'includedServices',
          title: 'Included Services',
          type: 'array',
          of: [{ type: 'string' }],
        }),
      ],
      hidden: ({ parent }) => parent?.layout !== 'venue-menu',
    }),
  ],
  preview: {
    select: {
      layout: 'layout',
      heading: 'heading',
      image: 'image',
    },
    prepare({ layout, heading, image }) {
      const layoutTitles = {
        'food-menu': 'Food Menu',
        'spa-menu': 'Spa Menu',
        'venue-menu': 'Venue Menu',
      }
      return {
        title: heading || layoutTitles[layout as keyof typeof layoutTitles] || 'Menu Section',
        subtitle: layoutTitles[layout as keyof typeof layoutTitles],
        media: image,
      }
    },
  },
})
