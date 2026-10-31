import { defineField, defineType } from 'sanity';

export const productCategory = defineType({
  name: 'productCategory',
  title: 'Categoría de producto',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Nombre', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: (r) => r.required() }),
    defineField({ name: 'order', title: 'Orden', type: 'number', initialValue: 10 }),
  ],
});

export const product = defineType({
  name: 'product',
  title: 'Producto',
  type: 'document',
  groups: [
    { name: 'main', title: 'Principal', default: true },
    { name: 'detail', title: 'Detalle' },
  ],
  fields: [
    defineField({ name: 'name', title: 'Nombre', type: 'string', group: 'main', validation: (r) => r.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', group: 'main', options: { source: 'name' }, validation: (r) => r.required() }),
    defineField({ name: 'brand', title: 'Marca', type: 'string', group: 'main' }),
    defineField({ name: 'category', title: 'Categoría', type: 'reference', to: [{ type: 'productCategory' }], group: 'main', validation: (r) => r.required() }),
    defineField({
      name: 'image',
      title: 'Foto',
      type: 'image',
      group: 'main',
      description: 'Ideal: PNG sin fondo, vertical (3:4). Se usa en la tarjeta y en la escena 3D si es el destacado.',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Texto alternativo', type: 'string' })],
    }),
    defineField({
      name: 'stock',
      title: 'Stock',
      type: 'string',
      group: 'main',
      options: { list: [
        { title: '🟢 Disponible', value: 'disponible' },
        { title: '🟡 Consultar stock', value: 'consultar' },
        { title: '🔴 Agotado', value: 'agotado' },
      ], layout: 'radio' },
      initialValue: 'disponible',
      validation: (r) => r.required(),
    }),
    defineField({ name: 'featured', title: 'Destacado en la home', type: 'boolean', group: 'main', initialValue: false }),
    defineField({ name: 'price', title: 'Precio (ARS)', type: 'number', group: 'main' }),
    defineField({ name: 'showPrice', title: 'Mostrar precio en la web', type: 'boolean', group: 'main', initialValue: false }),
    defineField({ name: 'description', title: 'Descripción corta', type: 'text', rows: 3, group: 'detail' }),
    defineField({ name: 'benefits', title: 'Beneficios', type: 'array', of: [{ type: 'string' }], options: { layout: 'tags' }, group: 'detail' }),
    defineField({ name: 'howToUse', title: 'Modo de uso', type: 'text', rows: 3, group: 'detail' }),
    defineField({ name: 'order', title: 'Orden', type: 'number', initialValue: 10, group: 'main' }),
  ],
  orderings: [{ title: 'Orden', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
  preview: {
    select: { title: 'name', brand: 'brand', stock: 'stock', media: 'image' },
    prepare: ({ title, brand, stock, media }) => ({
      title,
      media,
      subtitle: `${{ disponible: '🟢', consultar: '🟡', agotado: '🔴' }[stock as string] ?? ''} ${brand ?? ''}`,
    }),
  },
});
