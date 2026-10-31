import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { drawSwoosh } from './reveals';

/** Intro de marca: el trazo se dibuja, el nombre aparece y el contador sube. */
export function playPreloader(ready: Promise<unknown>) {
  const root = document.querySelector<HTMLElement>('[data-preloader]');
  if (!root) return { done: Promise.resolve(), root: null };
  const svg = root.querySelector<SVGSVGElement>('svg')!;
  const word = root.querySelector('[data-pre-word]')!;
  const tag = root.querySelector('[data-pre-tag]')!;
  const count = root.querySelector('[data-pre-count]')!;
  const split = SplitText.create(word, { type: 'chars', mask: 'chars' });

  const counter = { v: 0 };
  let loaded = false;
  ready.finally(() => (loaded = true));

  const done = new Promise<void>((resolve) => {
    const tl = gsap.timeline({ delay: 0.2 });
    tl.add(drawSwoosh(svg), 0)
      .from(split.chars, { yPercent: 110, duration: 1.3, ease: 'expo.out', stagger: 0.045 }, 0.35)
      .fromTo(tag, { letterSpacing: '1.8em', autoAlpha: 0 }, { letterSpacing: '0.9em', autoAlpha: 1, duration: 1.6, ease: 'expo.out' }, 0.9)
      .to(counter, {
        v: 86, duration: 2.1, ease: 'power2.inOut',
        onUpdate: () => (count.textContent = String(Math.round(counter.v))),
      }, 0);
    tl.eventCallback('onComplete', () => {
      const finish = () =>
        gsap.to(counter, {
          v: 100, duration: 0.45, ease: 'power2.out',
          onUpdate: () => (count.textContent = String(Math.round(counter.v))),
          onComplete: () => resolve(),
        });
      if (loaded) finish();
      else {
        const t = setTimeout(finish, 3500);
        ready.finally(() => { clearTimeout(t); finish(); });
      }
    });
  });
  return { done, root };
}

/** Sale el preloader: el fondo se vuelve transparente para que el mechón 3D tome el lugar del trazo. */
export function exitPreloader(root: HTMLElement, withGl: boolean) {
  const svg = root.querySelector('svg');
  const rest = root.querySelectorAll('[data-pre-word], [data-pre-tag], .preloader__count, .preloader__place');
  const tl = gsap.timeline({ onComplete: () => root.remove() });
  if (withGl) {
    tl.to(svg, { autoAlpha: 0, duration: 0.8, ease: 'power2.inOut' }, 0.15)
      .to(rest, { autoAlpha: 0, y: -24, duration: 0.8, ease: 'power3.in', stagger: 0.05 }, 0.5)
      .to(root, { backgroundColor: 'rgba(247,242,236,0)', duration: 1, ease: 'power2.inOut' }, 0.7);
  } else {
    tl.to(root.children, { autoAlpha: 0, y: -30, duration: 0.7, ease: 'power3.in', stagger: 0.05 }, 0)
      .to(root, { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'expo.inOut' }, 0.4);
  }
  return tl;
}
