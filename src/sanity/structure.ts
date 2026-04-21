import type {StructureResolver} from 'sanity/structure'
import { CogIcon } from '@sanity/icons'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Inness')
    .items([
      S.documentTypeListItem('page').title('Pages'),
      S.documentTypeListItem('room').title('Rooms'),
      // Show Peoplevine-backed calendar events
      S.documentTypeListItem('calendar').title('Calendar'),
      S.documentTypeListItem('product').title('Products'),
      S.divider(),
      S.documentTypeListItem('menu').title('Menus'),
      S.documentTypeListItem('footer').title('Footer'),
      S.listItem()
        .title('Site Settings')
        .icon(CogIcon)
        .child(
          S.document()
            .schemaType('siteSettings')
            .documentId('siteSettings'),
        ),
      ...S.documentTypeListItems().filter(
        (item) =>
          item.getId() &&
          ![
            'page',
            'room',
            'calendar',
            'product',
            'menu',
            'footer',
            'siteSettings',
            'productVariant',
          ].includes(item.getId()!),
      ),
    ])
