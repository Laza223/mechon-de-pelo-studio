import { seed } from '../data/seed';
import { client, QUERY, toImg } from './sanity';
import type { SiteContent } from './types';

let cache: Promise<SiteContent> | null = null;

/** Contenido del sitio: Sanity si está configurado, si no el seed local. Se resuelve una vez por build. */
export function getContent(): Promise<SiteContent> {
  cache ??= load();
  return cache;
}

async function load(): Promise<SiteContent> {
  if (!client) return seed;
  try {
    const d = await client.fetch(QUERY);
    const pick = <T>(arr: T[] | undefined, fb: T[]) => (arr && arr.length ? arr : fb);
    return {
      settings: { ...seed.settings, ...stripNulls(d.settings ?? {}) },
      services: pick(d.services, seed.services).map((s: any) => ({ ...s, id: s._id ?? s.id })),
      categories: pick(d.categories, seed.categories).map((c: any) => ({ ...c, id: c._id ?? c.id })),
      products: pick(d.products, seed.products).map((p: any) => ({
        ...p,
        id: p._id ?? p.id,
        benefits: p.benefits ?? [],
        image: p._id ? toImg(p.image, p.name) : p.image,
        showPrice: Boolean(p.showPrice),
        featured: Boolean(p.featured),
      })),
      gallery: pick(d.gallery, seed.gallery).map((g: any) => ({
        ...g,
        id: g._id ?? g.id,
        image: g._id ? toImg(g.image, g.caption) : g.image,
      })),
      faqs: pick(d.faqs, seed.faqs).map((f: any) => ({ ...f, id: f._id ?? f.id })),
    };
  } catch (err) {
    console.warn('[content] Sanity no respondió, uso el seed local:', err);
    return seed;
  }
}

function stripNulls<T extends object>(o: T): Partial<T> {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v != null && v !== '')) as Partial<T>;
}
