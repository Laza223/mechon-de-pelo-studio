import { defineField, defineType } from 'sanity';

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Configuración del sitio',
  type: 'document',
  fields: [
    defineField({
      name: 'whatsappNumber',
      title: 'Número de WhatsApp',
      type: 'string',
      description: 'Formato internacional sin "+" ni espacios. Ej.: 5492323123456. Permite enviar mensajes ya escritos.',
      validation: (r) => r.regex(/^\d{10,15}$/, { name: 'número' }).warning('Solo números, con 549 adelante'),
    }),
    defineField({
      name: 'whatsappLink',
      title: 'Link de WhatsApp (respaldo)',
      type: 'url',
      initialValue: 'https://wa.me/message/ZM5LQWOPSHXKN1',
    }),
    defineField({ name: 'instagramHandle', title: 'Usuario de Instagram', type: 'string', initialValue: 'mechondepelo.studio' }),
    defineField({ name: 'zone', title: 'Zona', type: 'string', initialValue: 'Luján, Buenos Aires' }),
    defineField({ name: 'announcement', title: 'Aviso destacado (opcional)', type: 'string' }),
    defineField({
      name: 'bookingNote',
      title: 'Nota sobre reservas',
      type: 'text',
      rows: 2,
      initialValue: 'Atención con turno previo, en el estudio o a domicilio. La dirección se comparte al confirmar el turno.',
    }),
    defineField({ name: 'seoTitle', title: 'Título para Google', type: 'string', group: 'seo' }),
    defineField({ name: 'seoDescription', title: 'Descripción para Google', type: 'text', rows: 3, group: 'seo' }),
  ],
  groups: [{ name: 'seo', title: 'SEO' }],
  preview: { prepare: () => ({ title: 'Configuración del sitio' }) },
});
