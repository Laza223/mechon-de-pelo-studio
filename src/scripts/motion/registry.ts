import type { ScrollTrigger } from 'gsap/ScrollTrigger';
import type Lenis from 'lenis';

/** Referencias compartidas entre módulos de animación. */
export const registry: {
  lenis?: Lenis;
  servicesPin?: ScrollTrigger;
} = {};
