export type ServiceCategory = 'peinados' | 'tratamientos' | 'trenzas';
export type PriceType = 'desde' | 'fijo' | 'consultar';
export type StockStatus = 'disponible' | 'consultar' | 'agotado';
export type ServiceIcon = 'lazo' | 'ondas' | 'brillo' | 'trenza' | 'gota';
export type ProductVisual =
  | 'jar' | 'tube' | 'bottle' | 'spray' | 'dropper' | 'bonnet' | 'brush';

/** Imagen: o viene de Sanity (url ya armada) o es un import local de astro:assets. */
export interface Img {
  src: string | ImageMetadata;
  width?: number;
  height?: number;
  alt: string;
  /** Builder opcional para srcset (solo Sanity). */
  srcset?: string;
  lqip?: string;
}

export interface SiteSettings {
  whatsappNumber?: string;
  whatsappLink: string;
  instagramHandle: string;
  zone: string;
  announcement?: string;
  bookingNote: string;
  seoTitle: string;
  seoDescription: string;
}

export interface Service {
  id: string;
  title: string;
  slug: string;
  category: ServiceCategory;
  description: string;
  priceType: PriceType;
  price?: number;
  requiresDeposit?: boolean;
  occasions?: string[];
  icon: ServiceIcon;
  order: number;
}

export interface ProductCategory {
  id: string;
  title: string;
  slug: string;
  order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand?: string;
  category: string; // slug de categoría
  description: string;
  benefits: string[];
  howToUse?: string;
  image?: Img;
  /** Ilustración provisoria cuando no hay foto. */
  visual?: { kind: ProductVisual; color: string; accent?: string; label?: string };
  price?: number;
  showPrice: boolean;
  stock: StockStatus;
  featured: boolean;
  order: number;
}

export interface GalleryItem {
  id: string;
  image?: Img;
  category: ServiceCategory;
  caption: string;
  /** Tile tipográfico (sin foto) para la grilla editorial. */
  quote?: string;
  order: number;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  order: number;
}

export interface SiteContent {
  settings: SiteSettings;
  services: Service[];
  categories: ProductCategory[];
  products: Product[];
  gallery: GalleryItem[];
  faqs: Faq[];
}
