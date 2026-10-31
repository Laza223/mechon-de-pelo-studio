import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

export function splitLines(el: Element) {
  return SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'split-line', autoSplit: true });
}

export function initReveals(root: ParentNode = document) {
  // Títulos por líneas con máscara
  root.querySelectorAll<HTMLElement>('[data-split="lines"]').forEach((el) => {
    if (el.closest('[data-chapter]')) return;
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      autoSplit: true,
      onSplit(self) {
        gsap.set(el, { visibility: 'visible' });
        return gsap.from(self.lines, {
          yPercent: 110,
          duration: 1.25,
          ease: 'expo.out',
          stagger: 0.09,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        });
      },
    });
  });

  root.querySelectorAll<HTMLElement>('[data-split="chars"]').forEach((el) => {
    SplitText.create(el, {
      type: 'chars',
      mask: 'chars',
      onSplit(self) {
        gsap.set(el, { visibility: 'visible' });
        return gsap.from(self.chars, {
          yPercent: 115, rotate: 6, duration: 1.2, ease: 'expo.out', stagger: 0.035,
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        });
      },
    });
  });

  // Elementos que suben suavemente, en lote
  const ups = gsap.utils.toArray<HTMLElement>(root.querySelectorAll('[data-reveal="up"]'));
  gsap.set(ups, { autoAlpha: 0, y: 46 });
  ScrollTrigger.batch(ups, {
    start: 'top 90%',
    once: true,
    onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.09, overwrite: true }),
  });

  gsap.utils.toArray<HTMLElement>(root.querySelectorAll('[data-reveal="fade"]')).forEach((el) => {
    gsap.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
  });

  // Manifiesto: las palabras se "pintan" con el scroll
  root.querySelectorAll<HTMLElement>('[data-scrub-words]').forEach((el) => {
    const split = SplitText.create(el, { type: 'words', wordsClass: 'scrub-word' });
    gsap.set(el, { visibility: 'visible' });
    gsap.to(split.words, {
      opacity: 1,
      ease: 'none',
      stagger: 0.12,
      scrollTrigger: { trigger: el, start: 'top 78%', end: 'bottom 48%', scrub: 0.6 },
    });
  });

  // Líneas finas que se dibujan
  root.querySelectorAll<SVGPathElement>('[data-draw]').forEach((path) => {
    gsap.fromTo(path, { drawSVG: '0%' }, {
      drawSVG: '100%', ease: 'none',
      scrollTrigger: { trigger: path.closest('section') ?? path, start: 'top 75%', end: 'center 45%', scrub: 0.8 },
    });
  });

  // Swooshes que se dibujan al entrar (footer, 404)
  root.querySelectorAll<SVGSVGElement>('svg[data-swoosh]').forEach((svg) => {
    if (svg.closest('[data-preloader]')) return;
    drawSwoosh(svg, { scrollTrigger: { trigger: svg, start: 'top 85%', once: true } });
  });

  // Footer: palabra gigante
  const word = document.querySelector('.footer__word');
  if (word) {
    SplitText.create(word, {
      type: 'chars',
      mask: 'chars',
      onSplit: (self) =>
        gsap.from(self.chars, {
          yPercent: 100, duration: 1.4, ease: 'expo.out', stagger: 0.04,
          scrollTrigger: { trigger: word, start: 'top 92%', once: true },
        }),
    });
  }
}

export function drawSwoosh(svg: SVGSVGElement, vars: gsap.TimelineVars = {}) {
  const mask = svg.querySelector('.swoosh__mask');
  const strands = svg.querySelectorAll('.swoosh__strands path');
  const tl = gsap.timeline(vars);
  if (mask) tl.fromTo(mask, { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.6, ease: 'silk' }, 0);
  if (strands.length) tl.fromTo(strands, { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.8, ease: 'silk', stagger: 0.08 }, 0.1);
  return tl;
}

/** Parallax interno de imágenes (galería). */
export function initParallax() {
  gsap.utils.toArray<HTMLElement>('[data-parallax-wrap]').forEach((wrap) => {
    const img = wrap.querySelector('img');
    if (!img) return;
    gsap.fromTo(img, { yPercent: -12 }, {
      yPercent: 0, ease: 'none',
      scrollTrigger: { trigger: wrap, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
  // Revelado tipo cortina para tiles
  gsap.utils.toArray<HTMLElement>('[data-tile]').forEach((tile, i) => {
    gsap.fromTo(tile, { clipPath: 'inset(100% 0% 0% 0% round 28px)' }, {
      clipPath: 'inset(0% 0% 0% 0% round 28px)', duration: 1.4, ease: 'expo.out', delay: (i % 3) * 0.08,
      scrollTrigger: { trigger: tile, start: 'top 92%', once: true },
      clearProps: 'clipPath',
    });
  });
}
