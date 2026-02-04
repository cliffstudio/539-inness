import type {StructureResolver} from 'sanity/structure'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Inness')
    .items([
      S.documentTypeListItem('page').title('Pages'),
      S.documentTypeListItem('room').title('Rooms'),
      S.documentTypeListItem('activity').title('Calendar'),
      S.documentTypeListItem('product').title('Products'),
      S.divider(),
      S.documentTypeListItem('menu').title('Menus'),
      S.documentTypeListItem('footer').title('Footer'),
      S.documentTypeListItem('metaData').title('Meta Data'),
      ...S.documentTypeListItems().filter(
        (item) => item.getId() && !['page', 'room', 'activity', 'product', 'menu', 'footer', 'metaData', 'productVariant'].includes(item.getId()!),
      ),
    ])
