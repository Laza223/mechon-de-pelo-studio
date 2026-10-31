import { defineField, defineType } from 'sanity';

export const service = defineType({
  name: 'service',
  title: 'Servicio',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Nombre', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: (r) => r.required() }),
    defineField({
      name: 'category',
      title: 'Categoría',
      type: 'string',
      options: { list: [
        { title: 'Peinados', value: 'peinados' },
        { title: 'Tratamientos', value: 'tratamientos' },
        { title: 'Trenzas africanas', value: 'trenzas' },
      ], layout: 'radio' },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'description', title: 'Descripción', type: 'text', rows: 3 }),
    defineField({
      name: 'priceType',
      title: 'Tipo de precio',
      type: 'string',
      options: { list: [
        { title: 'Desde', value: 'desde' },
        { title: 'Precio fijo', value: 'fijo' },
        { title: 'Consultar', value: 'consultar' },
      ], layout: 'radio', direction: 'horizontal' },
      initialValue: 'desde',
    }),
    defineField({
      name: 'price',
      title: 'Precio (ARS)',
      type: 'number',
      hidden: ({ parent }) => parent?.priceType === 'consultar',
      validation: (r) => r.min(0),
    }),
    defineField({ name: 'requiresDeposit', title: '¿Requiere seña?', type: 'boolean', initialValue: false }),
    defineField({ name: 'occasions', title: 'Ocasiones', type: 'array', of: [{ type: 'string' }], options: { layout: 'tags' } }),
    defineField({
      name: 'icon',
      title: 'Ícono',
      type: 'string',
      options: { list: ['lazo', 'ondas', 'brillo', 'trenza', 'gota'] },
      initialValue: 'brillo',
    }),
    defineField({ name: 'order', title: 'Orden', type: 'number', initialValue: 10 }),
  ],
  orderings: [{ title: 'Orden', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
  preview: {
    select: { title: 'title', category: 'category', price: 'price', priceType: 'priceType' },
    prepare: ({ title, category, price, priceType }) => ({
      title,
      subtitle: `${category ?? ''} · ${priceType === 'consultar' || !price ? 'Consultar' : `${priceType === 'desde' ? 'Desde ' : ''}$${price.toLocaleString('es-AR')}`}`,
    }),
  },
});
