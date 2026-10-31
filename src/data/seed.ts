/** Seed listo para el sitio: resuelve las fotos locales con astro:assets. */
import type { ImageMetadata } from 'astro';
import type { SiteContent } from '../lib/types';
import { seedData } from './seed-data';

const files = import.meta.glob<{ default: ImageMetadata }>('../assets/gallery/*.{jpg,jpeg,png,webp}', { eager: true });
const byName = (name: string) => files[`../assets/gallery/${name}`]?.default;

export const seed: SiteContent = {
  ...seedData,
  gallery: seedData.gallery.map(({ imageFile, alt, ...g }) => {
    const src = imageFile ? byName(imageFile) : undefined;
    return { ...g, image: src ? { src, alt: alt ?? g.caption } : undefined };
  }),
};
