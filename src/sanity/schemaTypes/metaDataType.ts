export const metaDataType = {
  name: 'metaData',
  title: 'Meta Data',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
    },
    {
      name: 'description',
      title: 'Description',
      type: 'string',
    },
    {
      name: 'keywords',
      title: 'Keywords',
      type: 'string',
    },
    {
      name: 'socialimage',
      title: 'Social Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
  ],
}