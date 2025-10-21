import type {StructureResolver} from 'sanity/structure'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Inness')
    .items([
      S.documentTypeListItem('page').title('Pages'),
      S.documentTypeListItem('room').title('Rooms'),
      S.documentTypeListItem('menu').title('Menus'),
      S.documentTypeListItem('footer').title('Footer'),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) => item.getId() && !['page', 'room', 'menu', 'footer'].includes(item.getId()!),
      ),
    ])
