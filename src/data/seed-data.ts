/**
 * Contenido inicial (brief + lo que publica en Instagram), sin dependencias de Astro.
 * Lo usan el sitio (vía seed.ts) y el script de carga a Sanity (scripts/seed-sanity.ts).
 * ⚠️ Las fotos de galería son recortes provisorios de historias: reemplazar por originales.
 */
import type { SiteContent, GalleryItem } from '../lib/types';

export type SeedGallery = Omit<GalleryItem, 'image'> & { imageFile?: string; alt?: string };
export type SeedContent = Omit<SiteContent, 'gallery'> & { gallery: SeedGallery[] };

export const seedData: SeedContent = {
  settings: {
    // Pendiente: número comercial en formato internacional sin "+" (ej. 5492323XXXXXX)
    whatsappNumber: undefined,
    whatsappLink: 'https://wa.me/message/ZM5LQWOPSHXKN1',
    instagramHandle: 'mechondepelo.studio',
    zone: 'Luján, Buenos Aires',
    bookingNote: 'Atención con turno previo, en el estudio o a domicilio. La dirección se comparte al confirmar el turno.',
    seoTitle: 'Mechón de Pelo | Hair Studio en Luján — Peinados, tratamientos y trenzas africanas',
    seoDescription:
      'Estudio boutique de cuidado capilar en Luján. Peinados para XV, casamientos y egresos, alisados, nutriciones, trenzas africanas y productos para cuidar tu pelo en casa. Turnos por WhatsApp o Instagram.',
  },

  services: [
    {
      id: 'svc-peinados', title: 'Peinados para eventos', slug: 'peinados', category: 'peinados',
      description: 'Recogidos, semirecogidos, ondas y trenzas pensados para vos, tu vestido y tu noche. El valor depende del largo del cabello, el tipo de peinado y la complejidad del trabajo.',
      priceType: 'desde', price: 10000,
      occasions: ['XV', 'Casamientos', 'Egresos', 'Fiestas', 'Eventos sociales'],
      icon: 'lazo', order: 1,
    },
    {
      id: 'svc-alisados', title: 'Alisados', slug: 'alisados', category: 'tratamientos',
      description: 'Cabello más liso, suave y con brillo por más tiempo.',
      priceType: 'desde', price: 35000, icon: 'ondas', order: 2,
    },
    {
      id: 'svc-nutricion', title: 'Nutriciones capilares', slug: 'nutriciones', category: 'tratamientos',
      description: 'Hidratación, brillo y fuerza para un cabello más saludable.',
      priceType: 'desde', price: 25000, icon: 'brillo', order: 3,
    },
    {
      id: 'svc-keratina', title: 'Shock de keratina', slug: 'shock-de-keratina', category: 'tratamientos',
      description: 'Reconstrucción profunda para cabellos dañados, secos o con frizz.',
      priceType: 'consultar', icon: 'gota', order: 4,
    },
    {
      id: 'svc-botox', title: 'Botox capilar', slug: 'botox-capilar', category: 'tratamientos',
      description: 'Rellena la fibra capilar, sella la cutícula y devuelve cuerpo y suavidad.',
      priceType: 'consultar', icon: 'brillo', order: 5,
    },
    {
      id: 'svc-trenzas', title: 'Trenzas africanas', slug: 'trenzas-africanas', category: 'trenzas',
      description: 'Estilo, personalidad y duración. Trenzas prolijas, parejas y hechas con paciencia.',
      priceType: 'fijo', price: 120000, requiresDeposit: true, icon: 'trenza', order: 6,
    },
  ],

  categories: [
    { id: 'cat-shampoos', title: 'Shampoos', slug: 'shampoos', order: 1 },
    { id: 'cat-acondicionadores', title: 'Acondicionadores', slug: 'acondicionadores', order: 2 },
    { id: 'cat-mascarillas', title: 'Mascarillas y baños de crema', slug: 'mascarillas', order: 3 },
    { id: 'cat-aceites', title: 'Aceites y sérums', slug: 'aceites-y-serums', order: 4 },
    { id: 'cat-proteccion', title: 'Protección y styling', slug: 'proteccion', order: 5 },
    { id: 'cat-accesorios', title: 'Accesorios', slug: 'accesorios', order: 6 },
  ],

  products: [
    {
      id: 'p-argan-oil', name: 'Oil de Argán', slug: 'oil-de-argan', brand: 'Fidelité', category: 'aceites-y-serums',
      description: 'Bruma de aceite de argán que aporta brillo y suavidad y reduce el frizz al instante.',
      benefits: ['Aporta brillo', 'Suaviza', 'Reduce el frizz'],
      howToUse: 'Pulverizar a 20 cm sobre el cabello seco o húmedo, de medios a puntas. No enjuagar.',
      visual: { kind: 'spray', color: '#9A5A1F', accent: '#1B1410', label: 'ARGAN' },
      showPrice: false, stock: 'disponible', featured: true, order: 1,
    },
    {
      id: 'p-extra-acida', name: 'Crema Extra Ácida Colormaster', slug: 'crema-extra-acida', brand: 'Fidelité', category: 'mascarillas',
      description: 'Sella la cutícula después de la decoloración, aporta suavidad y brillo. Con D-pantenol.',
      benefits: ['Sella la cutícula', 'Ideal post decoloración', 'Con D-pantenol'],
      howToUse: 'Aplicar sobre el cabello lavado, dejar actuar 5 a 10 minutos y enjuagar.',
      visual: { kind: 'jar', color: '#C4211C', accent: '#F4EDE6', label: 'colormaster' },
      showPrice: false, stock: 'disponible', featured: true, order: 2,
    },
    {
      id: 'p-keratina', name: 'Acondicionador con Keratina', slug: 'acondicionador-keratina', brand: 'Fidelité', category: 'acondicionadores',
      description: 'Smooth & Repair. Ideal para pelos dañados, secos o con frizz.',
      benefits: ['Repara', 'Disciplina', 'Anti-frizz'],
      howToUse: 'Después del shampoo, aplicar de medios a puntas, dejar actuar 2 minutos y enjuagar.',
      visual: { kind: 'tube', color: '#D2541E', accent: '#F6D9B8', label: 'KERATIN' },
      showPrice: false, stock: 'disponible', featured: true, order: 3,
    },
    {
      id: 'p-caviar', name: 'Protector Térmico Caviar', slug: 'protector-termico-caviar', brand: 'Fidelité', category: 'proteccion',
      description: 'Protege el cabello del calor de la planchita y el secador, con filtro UV.',
      benefits: ['Protección térmica', 'Filtro UV', 'Sin enjuague'],
      howToUse: 'Pulverizar sobre el cabello antes de usar secador o planchita.',
      visual: { kind: 'spray', color: '#5B2C83', accent: '#D9C7EC', label: 'CAVIAR' },
      showPrice: false, stock: 'disponible', featured: true, order: 4,
    },
    {
      id: 'p-coco', name: 'Acondicionador de Coco', slug: 'acondicionador-coco', brand: 'Fidelité', category: 'acondicionadores',
      description: 'Hidratación nutritiva con coco para un cabello suave y manejable.',
      benefits: ['Hidrata', 'Nutre', 'Suaviza'],
      visual: { kind: 'bottle', color: '#F3EEE6', accent: '#B98A3E', label: 'COCO' },
      showPrice: false, stock: 'disponible', featured: false, order: 5,
    },
    {
      id: 'p-almendra', name: 'Mascarilla de Almendra', slug: 'mascarilla-almendra', brand: 'Fidelité', category: 'mascarillas',
      description: 'Línea Hidratación. Deja el cabello más sedoso y manejable, reduce el frizz.',
      benefits: ['Sedosidad', 'Manejabilidad', 'Anti-frizz'],
      visual: { kind: 'jar', color: '#9C5A2E', accent: '#E9D3B9', label: 'FIDELITÉ' },
      showPrice: false, stock: 'disponible', featured: false, order: 6,
    },
    {
      id: 'p-cremoso-acido', name: 'Acondicionador Cremoso Ácido', slug: 'acondicionador-cremoso-acido', brand: 'Fidelité', category: 'acondicionadores',
      description: 'Ayuda a mantener el color y la luminosidad en pelos teñidos. pH 4.5.',
      benefits: ['Protege el color', 'Luminosidad', 'pH ácido'],
      visual: { kind: 'tube', color: '#B0182C', accent: '#151012', label: 'colormaster' },
      showPrice: false, stock: 'consultar', featured: false, order: 7,
    },
    {
      id: 'p-ultraliso', name: 'Sérum Ultra Liso', slug: 'serum-ultra-liso', brand: 'Avon Advance Techniques', category: 'aceites-y-serums',
      description: 'Controla el frizz, da movimiento y suavidad.',
      benefits: ['Control de frizz', 'Movimiento', 'Suavidad'],
      visual: { kind: 'dropper', color: '#C9CCD6', accent: '#3B2F86', label: 'ULTRA LISO' },
      showPrice: false, stock: 'consultar', featured: false, order: 8,
    },
    {
      id: 'p-masajeador', name: 'Masajeador de cuero cabelludo', slug: 'masajeador-cuero-cabelludo', brand: 'Mely', category: 'accesorios',
      description: 'Estimula la circulación, ayuda a limpiar en profundidad y es un mimo en cada lavado.',
      benefits: ['Estimula', 'Limpieza profunda', 'Relaja'],
      visual: { kind: 'brush', color: '#F2A7B5', accent: '#FFFFFF' },
      showPrice: false, stock: 'disponible', featured: false, order: 9,
    },
    {
      id: 'p-gorro-saten', name: 'Gorro de satén', slug: 'gorro-de-saten', category: 'accesorios',
      description: 'Protege tu peinado y tus trenzas mientras dormís, evita el frizz y el quiebre.',
      benefits: ['Cuida las trenzas', 'Menos frizz', 'Menos quiebre'],
      visual: { kind: 'bonnet', color: '#D9BFA3', accent: '#F4E8DA' },
      showPrice: false, stock: 'consultar', featured: false, order: 10,
    },
  ],

  gallery: [
    { id: 'g-1', imageFile: 'trenzas-clasicas.jpg', alt: 'Trenzas africanas clásicas vistas de espalda, con divisiones prolijas', category: 'trenzas', caption: 'Trenzas africanas clásicas', order: 1 },
    { id: 'g-2', category: 'peinados', caption: 'Recogido bajo con doble trenza lateral', quote: 'Cada peinado se piensa para vos, tu vestido y tu noche.', order: 2 },
    { id: 'g-3', imageFile: 'trenzas-detalle.jpg', alt: 'Detalle de las divisiones en trenzas africanas', category: 'trenzas', caption: 'Detalle de divisiones', order: 3 },
    { id: 'g-4', category: 'tratamientos', caption: 'Alisados y nutriciones', quote: 'Brillo, suavidad y un pelo que se deja peinar.', order: 4 },
    { id: 'g-5', category: 'peinados', caption: 'Doble trenza lateral con pelo suelto', quote: 'XV · Casamientos · Egresos · Fiestas', order: 5 },
  ],

  faqs: [
    { id: 'f-1', question: '¿Dónde atienden?', answer: 'En Luján, Buenos Aires. Atendemos en el estudio o a domicilio, según lo que coordinemos. La dirección se comparte al confirmar el turno.', order: 1 },
    { id: 'f-2', question: '¿Cómo reservo un turno?', answer: 'Escribinos por WhatsApp o por mensaje directo de Instagram contándonos qué servicio querés y qué día te queda cómodo. Te respondemos con la disponibilidad.', order: 2 },
    { id: 'f-3', question: '¿Hay que dejar seña?', answer: 'Solo para trenzas africanas. Para el resto de los servicios no pedimos seña.', order: 3 },
    { id: 'f-4', question: '¿Por qué los precios dicen “desde”?', answer: 'Porque el valor final depende del largo y la cantidad de cabello y de la complejidad del trabajo. Las trenzas africanas tienen precio fijo.', order: 4 },
    { id: 'f-5', question: '¿Cómo compro productos?', answer: 'Sumalos a tu consulta y envianos el pedido por WhatsApp. Coordinamos pago, retiro o entrega. Los productos están sujetos a disponibilidad.', order: 5 },
    { id: 'f-6', question: '¿Hacen envíos fuera de Luján?', answer: 'Consultanos por WhatsApp y vemos la mejor opción para que te llegue.', order: 6 },
  ],
};
