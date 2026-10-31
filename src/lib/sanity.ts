import { createClient, type SanityClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';
import type { Img } from './types';

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = import.meta.env.PUBLIC_SANITY_DATASET || 'production';

export const sanityEnabled = Boolean(projectId);

export const client: SanityClient | null = sanityEnabled
  ? createClient({ projectId, dataset, apiVersion: '2025-01-01', useCdn: false, perspective: 'published' })
  : null;

const builder = client ? createImageUrlBuilder(client) : null;

interface SanityImageField {
  asset?: { _ref?: string; _id?: string; metadata?: { dimensions?: { width: number; height: number }; lqip?: string } };
  alt?: string;
  hotspot?: unknown;
  crop?: unknown;
}

const WIDTHS = [480, 768, 1080, 1440, 1920];

/** Convierte un campo image de Sanity en nuestro Img con srcset (AVIF/WebP automático). */
export function toImg(field: SanityImageField | null | undefined, fallbackAlt = ''): Img | undefined {
  if (!builder || !field?.asset) return undefined;
  const dims = field.asset.metadata?.dimensions;
  const base = builder.image(field).auto('format').quality(82);
  return {
    src: base.width(1080).url(),
    width: dims?.width,
    height: dims?.height,
    alt: field.alt || fallbackAlt,
    srcset: WIDTHS.map((w) => `${base.width(w).url()} ${w}w`).join(', '),
    lqip: field.asset.metadata?.lqip,
  };
}

const IMG = `{..., asset->{_id, metadata{dimensions, lqip}}}`;

export const QUERY = /* groq */ `{
  "settings": *[_type == "siteSettings"][0],
  "services": *[_type == "service"] | order(order asc){..., "slug": slug.current},
  "categories": *[_type == "productCategory"] | order(order asc){..., "slug": slug.current},
  "products": *[_type == "product"] | order(order asc){..., "slug": slug.current, "category": category->slug.current, image${IMG}},
  "gallery": *[_type == "galleryItem"] | order(order asc){..., image${IMG}},
  "faqs": *[_type == "faq"] | order(order asc)
}`;
