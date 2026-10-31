import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { esESLocale } from '@sanity/locale-es-es';
import { schemaTypes } from './studio/schemas';
import { structure, singletonTypes } from './studio/structure';

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID ?? process.env.PUBLIC_SANITY_PROJECT_ID ?? '';
const dataset = import.meta.env.PUBLIC_SANITY_DATASET ?? process.env.PUBLIC_SANITY_DATASET ?? 'production';

export default defineConfig({
  name: 'mechon-de-pelo',
  title: 'Mechón de Pelo · Panel',
  projectId,
  dataset,
  plugins: [structureTool({ structure }), esESLocale()],
  schema: {
    types: schemaTypes,
    // la configuración es un documento único: no se puede crear otro desde "+"
    templates: (templates) => templates.filter(({ schemaType }) => !singletonTypes.has(schemaType)),
  },
  document: {
    actions: (input, ctx) =>
      singletonTypes.has(ctx.schemaType)
        ? input.filter(({ action }) => action && ['publish', 'discardChanges', 'restore'].includes(action))
        : input,
  },
});
