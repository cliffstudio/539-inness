import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'option',
  title: 'Option',
  type: 'object',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
    }),
    defineField({
      name: 'values',
      title: 'Values',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'optionValue',
          title: 'Option Value',
          fields: [
            defineField({
              name: 'value',
              title: 'Value',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: {
              value: 'value',
            },
            prepare({value}) {
              return {
                title: value,
              }
            },
          },
        },
      ],
    }),
  ],
})
