import { defineField, defineType } from 'sanity';

export const galleryItem = defineType({
  name: 'galleryItem',
  title: 'Trabajo (galería)',
  type: 'document',
  fields: [
    defineField({ name: 'caption', title: 'Título', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'category',
      title: 'Categoría',
      type: 'string',
      options: { list: [
        { title: 'Peinados', value: 'peinados' },
        { title: 'Tratamientos', value: 'tratamientos' },
        { title: 'Trenzas', value: 'trenzas' },
      ], layout: 'radio' },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'image',
      title: 'Foto',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Texto alternativo', type: 'string' })],
    }),
    defineField({ name: 'quote', title: 'Frase (si no hay foto)', type: 'string' }),
    defineField({ name: 'order', title: 'Orden', type: 'number', initialValue: 10 }),
  ],
  preview: { select: { title: 'caption', subtitle: 'category', media: 'image' } },
});

export const faq = defineType({
  name: 'faq',
  title: 'Pregunta frecuente',
  type: 'document',
  fields: [
    defineField({ name: 'question', title: 'Pregunta', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'answer', title: 'Respuesta', type: 'text', rows: 4, validation: (r) => r.required() }),
    defineField({ name: 'order', title: 'Orden', type: 'number', initialValue: 10 }),
  ],
  preview: { select: { title: 'question', subtitle: 'answer' } },
});
