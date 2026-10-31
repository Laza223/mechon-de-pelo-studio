import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { Flip } from 'gsap/Flip';
import { CustomEase } from 'gsap/CustomEase';

import { initSmoothScroll } from './motion/smooth-scroll';
import { initReveals, initParallax } from './motion/reveals';
import { initHeader } from './motion/header';
import { initCursor, initMagnetic } from './motion/cursor';
import { initServices } from './motion/services';
import { initFilters, initLightbox, initAccordions } from './motion/interactions';
import { playPreloader, exitPreloader } from './motion/preloader';
import { initBag } from './shop/bag';
import { initWizard } from './booking/wizard';

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, Flip, CustomEase);
CustomEase.create('silk', '0.65, 0.05, 0.15, 1');

const html = document.documentElement;

function supportsWebGL2() {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2'));
  } catch {
    return false;
  }
}

function heroIn() {
  const title = document.querySelector<HTMLElement>('[data-hero-title]');
  const ins = document.querySelectorAll('[data-hero-in]');
  const header = document.querySelector('[data-header]');
  const tl = gsap.timeline();
  if (title) {
    const split = SplitText.create(title, { type: 'lines,chars', mask: 'lines' });
    gsap.set(title, { visibility: 'visible' });
    tl.from(split.chars, { yPercent: 120, rotate: 4, duration: 1.5, ease: 'expo.out', stagger: 0.022 }, 0);
  }
  tl.fromTo(ins, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 1.3, ease: 'expo.out', stagger: 0.12 }, 0.45);
  if (header) tl.fromTo(header, { autoAlpha: 0, y: -20 }, { autoAlpha: 1, y: 0, duration: 1.2, ease: 'expo.out' }, 0.6);
  return tl;
}

export async function boot() {
  // Funcionalidad que no depende de animaciones
  initBag();
  initWizard();
  initLightbox();

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches || html.classList.contains('no-motion');
  if (reduced) {
    html.classList.add('no-motion', 'is-booted');
    initAccordions(false);
    initFilters('.gallery__filters', '[data-tile]');
    initFilters('[data-catalog-filters]', '[data-product-card]');
    initHeader();
    return;
  }

  html.classList.add('is-booted');
  const isHome = document.body.hasAttribute('data-home');
  const mobile = matchMedia('(max-width: 960px)').matches;
  const lenis = initSmoothScroll();

  initHeader();
  initCursor();
  initMagnetic();
  initAccordions(true);
  initFilters('.gallery__filters', '[data-tile]');
  initFilters('[data-catalog-filters]', '[data-product-card]');

  await document.fonts.ready;

  if (!isHome) {
    initReveals();
    gsap.set('[data-hero-in], [data-hero-title]', { autoAlpha: 1 });
    return;
  }

  // ---------- Home ----------
  lenis.stop();
  window.scrollTo(0, 0);
  initServices();
  initReveals();
  initParallax();
  gsap.set('[data-header]', { autoAlpha: 0 });

  const revisit = html.classList.contains('is-revisit');
  const host = document.querySelector<HTMLElement>('[data-gl-stage]');
  const wantsGl = Boolean(host) && supportsWebGL2();

  const scenePromise = wantsGl && host
    ? import('./webgl')
        .then((m) => m.createHairScene({ host, mobile, gsap, ScrollTrigger, getScroll: () => window.scrollY }))
        .catch((err) => { console.warn('[webgl] sin escena 3D:', err); return null; })
    : Promise.resolve(null);

  const finish = () => {
    lenis.start();
    ScrollTrigger.refresh();
    try { sessionStorage.setItem('mdp-visited', '1'); } catch {}
  };

  if (revisit) {
    const scene = await scenePromise;
    scene?.skipIntro();
    heroIn();
    finish();
    return;
  }

  const { done, root } = playPreloader(scenePromise);
  await done;
  const scene = await scenePromise;
  if (root) exitPreloader(root, Boolean(scene));
  if (scene) {
    scene.intro(gsap, () => heroIn().then(finish));
  } else {
    gsap.delayedCall(0.6, () => heroIn().then(finish));
  }
}
