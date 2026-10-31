import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/** Filtros con transición Flip (galería y catálogo). */
export function initFilters(groupSel: string, itemSel: string, attr = 'cat') {
  const group = document.querySelector<HTMLElement>(groupSel);
  if (!group) return;
  const items = gsap.utils.toArray<HTMLElement>(itemSel);
  group.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-filter]');
    if (!btn) return;
    const key = btn.dataset.filter!;
    group.querySelectorAll('[data-filter]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    const state = Flip.getState(items);
    items.forEach((it) => {
      const cat = it.dataset[attr];
      it.classList.toggle('is-hidden', !(key === 'todos' || cat === key || cat === 'todos'));
    });
    Flip.from(state, {
      duration: 0.8,
      ease: 'expo.inOut',
      scale: true,
      absolute: true,
      stagger: 0.02,
      onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, scale: 0.92 }, { autoAlpha: 1, scale: 1, duration: 0.6, delay: 0.25 }),
      onLeave: (els) => gsap.to(els, { autoAlpha: 0, scale: 0.92, duration: 0.4 }),
      onComplete: () => ScrollTrigger.refresh(),
    });
  });
}

export function initLightbox() {
  const dialog = document.querySelector<HTMLDialogElement>('[data-lightbox-dialog]');
  if (!dialog) return;
  const img = dialog.querySelector<HTMLImageElement>('[data-lightbox-img]')!;
  const cap = dialog.querySelector<HTMLElement>('[data-lightbox-caption]')!;
  document.addEventListener('click', (e) => {
    const trigger = (e.target as HTMLElement).closest<HTMLElement>('[data-lightbox]');
    if (!trigger) return;
    const src = trigger.querySelector('img');
    if (!src) return;
    img.src = src.currentSrc || src.src;
    img.alt = src.alt;
    cap.textContent = trigger.querySelector('.tile__title')?.textContent ?? '';
    dialog.showModal();
    gsap.fromTo(dialog.querySelector('figure'), { scale: 0.94, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.7, ease: 'expo.out' });
  });
  dialog.querySelector('[data-lightbox-close]')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
}

/** <details> con altura animada. */
export function initAccordions(animate: boolean) {
  document.querySelectorAll<HTMLDetailsElement>('[data-accordion]').forEach((d) => {
    const summary = d.querySelector('summary')!;
    const body = d.querySelector<HTMLElement>('.qa__a')!;
    summary.addEventListener('click', (e) => {
      if (!animate) return;
      e.preventDefault();
      if (d.open) {
        gsap.to(body, { height: 0, duration: 0.55, ease: 'expo.inOut', onComplete: () => { d.open = false; gsap.set(body, { clearProps: 'height' }); ScrollTrigger.refresh(); } });
      } else {
        d.open = true;
        gsap.fromTo(body, { height: 0 }, { height: 'auto', duration: 0.7, ease: 'expo.out', onComplete: () => ScrollTrigger.refresh() });
      }
    });
  });
}
