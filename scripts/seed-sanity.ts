/**
 * Carga el contenido inicial en Sanity (servicios, productos, galería, FAQ y configuración).
 * Uso:  npm run seed:sanity   (requiere PUBLIC_SANITY_PROJECT_ID y SANITY_WRITE_TOKEN en .env)
 * Es idempotente: usa IDs fijos y createOrReplace.
 */
import { createClient } from '@sanity/client';
import { createReadStream } from 'node:fs';
import { resolve } from 'node:path';
import { seedData } from '../src/data/seed-data.ts';

const projectId = process.env.PUBLIC_SANITY_PROJECT_ID;
const token = process.env.SANITY_WRITE_TOKEN;
if (!projectId || !token) {
  console.error('Faltan PUBLIC_SANITY_PROJECT_ID o SANITY_WRITE_TOKEN en .env');
  process.exit(1);
}
const client = createClient({
  projectId,
  dataset: process.env.PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2025-01-01',
  token,
  useCdn: false,
});

const slug = (current: string) => ({ _type: 'slug', current });

async function upload(file: string) {
  const asset = await client.assets.upload('image', createReadStream(resolve('src/assets/gallery', file)), { filename: file });
  return { _type: 'image', asset: { _type: 'reference', _ref: asset._id } };
}

async function main() {
  const tx = client.transaction();
  const s = seedData.settings;
  tx.createOrReplace({ _id: 'siteSettings', _type: 'siteSettings', ...s });

  for (const v of seedData.services) {
    const { id, slug: sl, ...rest } = v;
    tx.createOrReplace({ _id: id, _type: 'service', ...rest, slug: slug(sl) });
  }
  for (const c of seedData.categories) {
    tx.createOrReplace({ _id: c.id, _type: 'productCategory', title: c.title, slug: slug(c.slug), order: c.order });
  }
  for (const p of seedData.products) {
    const cat = seedData.categories.find((c) => c.slug === p.category);
    tx.createOrReplace({
      _id: p.id, _type: 'product', name: p.name, slug: slug(p.slug), brand: p.brand,
      category: cat ? { _type: 'reference', _ref: cat.id } : undefined,
      description: p.description, benefits: p.benefits, howToUse: p.howToUse,
      price: p.price, showPrice: p.showPrice, stock: p.stock, featured: p.featured, order: p.order,
    });
  }
  for (const g of seedData.gallery) {
    const image = g.imageFile ? { ...(await upload(g.imageFile)), alt: g.alt } : undefined;
    tx.createOrReplace({ _id: g.id, _type: 'galleryItem', caption: g.caption, category: g.category, quote: g.quote, order: g.order, image });
  }
  for (const f of seedData.faqs) {
    tx.createOrReplace({ _id: f.id, _type: 'faq', question: f.question, answer: f.answer, order: f.order });
  }
  const res = await tx.commit();
  console.log(`✓ ${res.results.length} documentos cargados en Sanity.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
