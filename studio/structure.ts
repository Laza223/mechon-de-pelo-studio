import type { StructureResolver } from 'sanity/structure';

/** Menú del Studio en español, con la configuración como documento único. */
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Mechón de Pelo')
    .items([
      S.listItem().title('Productos').schemaType('product').child(S.documentTypeList('product').title('Productos').defaultOrdering([{ field: 'order', direction: 'asc' }])),
      S.listItem().title('Categorías de productos').schemaType('productCategory').child(S.documentTypeList('productCategory').title('Categorías')),
      S.divider(),
      S.listItem().title('Servicios y precios').schemaType('service').child(S.documentTypeList('service').title('Servicios').defaultOrdering([{ field: 'order', direction: 'asc' }])),
      S.listItem().title('Trabajos (galería)').schemaType('galleryItem').child(S.documentTypeList('galleryItem').title('Trabajos')),
      S.listItem().title('Preguntas frecuentes').schemaType('faq').child(S.documentTypeList('faq').title('Preguntas')),
      S.divider(),
      S.listItem()
        .title('Configuración del sitio')
        .id('siteSettings')
        .child(S.document().schemaType('siteSettings').documentId('siteSettings').title('Configuración del sitio')),
    ]);

export const singletonTypes = new Set(['siteSettings']);
