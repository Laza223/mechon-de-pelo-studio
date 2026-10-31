import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { registry } from './registry';

/** Desktop: la escena de servicios se fija y los 3 capítulos se suceden con el scroll. */
export function initServices() {
  const stage = document.querySelector<HTMLElement>('[data-services-stage]');
  if (!stage) return;
  const chapters = gsap.utils.toArray<HTMLElement>('[data-chapter]');
  const bar = stage.querySelector('[data-services-bar]');
  const count = stage.querySelector('[data-services-count]');
  const mm = gsap.matchMedia();

  mm.add('(min-width: 961px)', () => {
    const parts = (ch: HTMLElement) => ch.querySelectorAll(':scope > *');
    gsap.set(chapters.slice(1), { autoAlpha: 0 });
    chapters.slice(1).forEach((ch) => gsap.set(parts(ch), { y: 50, autoAlpha: 0 }));

    const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
    tl.to({}, { duration: 0.3 });
    chapters.forEach((ch, i) => {
      const nx = chapters[i + 1];
      if (!nx) return;
      const at = i === 0 ? 0.3 : 0.63;
      tl.to(parts(ch), { y: -40, autoAlpha: 0, stagger: 0.012, duration: 0.07 }, at)
        .set(ch, { autoAlpha: 0 }, at + 0.08)
        .set(nx, { autoAlpha: 1 }, at + 0.06)
        .to(parts(nx), { y: 0, autoAlpha: 1, stagger: 0.014, duration: 0.09, ease: 'power3.out' }, at + 0.06);
    });
    tl.to({}, { duration: 0.25 }, '>');

    const pin = ScrollTrigger.create({
      trigger: stage,
      start: 'top top',
      end: '+=260%',
      pin: true,
      scrub: 0.4,
      animation: tl,
      onUpdate(self) {
        const p = self.progress;
        const idx = p < 0.36 ? 0 : p < 0.69 ? 1 : 2;
        if (count) count.textContent = `0${idx + 1}`;
        if (bar) gsap.set(bar, { scaleX: 0.333 + p * 0.667 });
      },
    });
    registry.servicesPin = pin;
    return () => {
      registry.servicesPin = undefined;
      gsap.set(chapters, { clearProps: 'all' });
      chapters.forEach((ch) => gsap.set(parts(ch), { clearProps: 'all' }));
    };
  });

  mm.add('(max-width: 960px)', () => {
    chapters.forEach((ch) => {
      gsap.from(ch.querySelectorAll(':scope > *'), {
        y: 40, autoAlpha: 0, duration: 1, ease: 'expo.out', stagger: 0.07,
        scrollTrigger: { trigger: ch, start: 'top 75%', once: true },
      });
    });
  });
}
