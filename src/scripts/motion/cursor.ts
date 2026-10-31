import { gsap } from 'gsap';

export function initCursor() {
  if (!matchMedia('(pointer: fine)').matches) return;
  const el = document.querySelector<HTMLElement>('[data-cursor]');
  if (!el) return;
  const ring = el.querySelector<HTMLElement>('.cursor__ring')!;
  const dot = el.querySelector<HTMLElement>('.cursor__dot')!;
  const label = el.querySelector<HTMLElement>('[data-cursor-label]')!;
  const rx = gsap.quickTo(ring, 'x', { duration: 0.55, ease: 'expo.out' });
  const ry = gsap.quickTo(ring, 'y', { duration: 0.55, ease: 'expo.out' });
  const dx = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3.out' });
  const dy = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3.out' });
  gsap.set(el, { autoAlpha: 0 });

  window.addEventListener('pointermove', (e) => {
    gsap.to(el, { autoAlpha: 1, duration: 0.3, overwrite: 'auto' });
    rx(e.clientX); ry(e.clientY); dx(e.clientX); dy(e.clientY);
    const t = e.target as HTMLElement;
    const view = t.closest<HTMLElement>('[data-cursor]:not(.cursor)');
    const link = t.closest('a, button, label, summary, input, textarea');
    el.classList.toggle('is-view', Boolean(view));
    el.classList.toggle('is-link', !view && Boolean(link));
    if (view) label.textContent = view.dataset.cursor || 'Ver';
  }, { passive: true });
  document.addEventListener('pointerleave', () => gsap.to(el, { autoAlpha: 0, duration: 0.3 }));
}

export function initMagnetic() {
  if (!matchMedia('(pointer: fine)').matches) return;
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((btn) => {
    const qx = gsap.quickTo(btn, 'x', { duration: 0.8, ease: 'elastic.out(1, 0.4)' });
    const qy = gsap.quickTo(btn, 'y', { duration: 0.8, ease: 'elastic.out(1, 0.4)' });
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      qx((e.clientX - (r.left + r.width / 2)) * 0.28);
      qy((e.clientY - (r.top + r.height / 2)) * 0.38);
    });
    btn.addEventListener('pointerleave', () => { qx(0); qy(0); });
  });
}
