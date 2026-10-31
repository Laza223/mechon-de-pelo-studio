// @ts-check
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import sitemap from '@astrojs/sitemap';

const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');
const projectId = env.PUBLIC_SANITY_PROJECT_ID;
const dataset = env.PUBLIC_SANITY_DATASET || 'production';

const integrations = [sitemap({ filter: (page) => !page.includes('/admin') })];

// El Studio en /admin solo se monta cuando hay un proyecto de Sanity configurado.
if (projectId) {
  const { default: sanity } = await import('@sanity/astro');
  const { default: react } = await import('@astrojs/react');
  integrations.push(
    sanity({ projectId, dataset, useCdn: false, apiVersion: '2025-01-01', studioBasePath: '/admin' }),
    react(),
  );
}

export default defineConfig({
  site: env.PUBLIC_SITE_URL || 'https://mechondepelo.com.ar',
  integrations,
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  vite: {
    build: { assetsInlineLimit: 2048 },
  },
});
