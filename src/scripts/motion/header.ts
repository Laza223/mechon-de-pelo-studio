import { gsap } from 'gsap';
import { registry } from './registry';

export function initHeader() {
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (!header) return;
  const fab = document.querySelector<HTMLElement>('[data-fab]');
  const footer = document.querySelector<HTMLElement>('.footer');
  const darkEls = [...document.querySelectorAll<HTMLElement>('.section--dark, .footer')];
  const html = document.documentElement;
  let lastY = window.scrollY;
  let menuOpen = false;

  gsap.ticker.add(() => {
    const y = window.scrollY;
    const dy = y - lastY;
    if (Math.abs(dy) > 2) {
      header.classList.toggle('is-hidden', dy > 0 && y > 420 && !menuOpen);
      lastY = y;
    }
    header.classList.toggle('is-scrolled', y > 30);
    const mid = 40;
    const dark = html.classList.contains('gl-on')
      ? html.classList.contains('is-dark-bg')
      : darkEls.some((el) => { const r = el.getBoundingClientRect(); return r.top <= mid && r.bottom >= mid; });
    header.classList.toggle('is-dark', dark && !menuOpen);
    if (fab) {
      const nearFooter = footer ? footer.getBoundingClientRect().top < window.innerHeight * 0.9 : false;
      fab.classList.toggle('is-visible', y > window.innerHeight * 0.7 && !nearFooter);
    }
  });

  // Menú móvil
  const toggle = header.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const menu = header.querySelector<HTMLElement>('[data-menu]');
  if (!toggle || !menu) return;
  const links = menu.querySelectorAll('[data-menu-link]');
  const setOpen = (open: boolean) => {
    menuOpen = open;
    toggle.setAttribute('aria-expanded', String(open));
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(() => menu.classList.add('is-open'));
      registry.lenis?.stop();
      gsap.fromTo(links, { yPercent: 60, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.9, ease: 'expo.out', stagger: 0.06, delay: 0.25 });
    } else {
      menu.classList.remove('is-open');
      registry.lenis?.start();
      setTimeout(() => { if (!menuOpen) menu.hidden = true; }, 800);
    }
  };
  toggle.addEventListener('click', () => setOpen(!menuOpen));
  menu.addEventListener('click', (e) => { if ((e.target as HTMLElement).closest('a')) setOpen(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menuOpen) setOpen(false); });
}
