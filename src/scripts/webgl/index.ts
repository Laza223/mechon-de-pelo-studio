import { Color, Group, Vector3 } from 'three';
import type { ScrollTrigger as ST } from 'gsap/ScrollTrigger';
import { Stage } from './Stage';
import { HairField, STATE } from './HairField';
import { ProductPlane } from './ProductPlane';
import { registry } from '../motion/registry';

/** Recorrido de estados a lo largo de la página. */
const SEQ = [STATE.LOGO, STATE.FLOW, STATE.UPDO, STATE.STRAIGHT, STATE.BRAID, STATE.WRAP, STATE.FLOW, STATE.LOGO];

type K = {
  seq: number; x: number; y: number; s: number;
  rx: number; ry: number; rz: number;
  opacity: number; dark: number; wind: number; shine: number;
  aLogo: number; aShop: number; aFooter: number; plane: number;
};
const KEYS = Object.keys({
  seq: 0, x: 0, y: 0, s: 0, rx: 0, ry: 0, rz: 0, opacity: 0, dark: 0, wind: 0, shine: 0, aLogo: 0, aShop: 0, aFooter: 0, plane: 0,
}) as (keyof K)[];

const base: K = { seq: 1, x: 0, y: 0, s: 1, rx: 0, ry: 0, rz: 0, opacity: 1, dark: 0, wind: 1, shine: 0, aLogo: 0, aShop: 0, aFooter: 0, plane: 0 };
const k = (o: Partial<K>): K => ({ ...base, ...o });

function frames(mobile: boolean) {
  const m = mobile;
  return {
    pre: k({ seq: 0, aLogo: 1, wind: 0.4 }),
    hero: k({ seq: 1, x: m ? 0.12 : 0.5, y: m ? 0.42 : 0.22, s: m ? 0.62 : 0.92, rz: 0.1, rx: 0.1 }),
    manifesto: k({ seq: 1, x: m ? 0.3 : 0.56, y: m ? 0.42 : -0.06, s: m ? 0.5 : 0.82, rz: 0.14, ry: 0.35, wind: 0.6, opacity: m ? 0.55 : 1 }),
    updo: k({ seq: 2, x: m ? 0 : 0.42, y: m ? 0.46 : -0.02, s: m ? 0.42 : 0.8, ry: 0.2, opacity: m ? 0.8 : 1 }),
    straight: k({ seq: 3, x: m ? 0 : 0.45, y: m ? 0.46 : 0, s: m ? 0.42 : 0.78, shine: 1, opacity: m ? 0.8 : 1 }),
    braid: k({ seq: 4, x: m ? 0 : 0.45, y: m ? 0.46 : 0, s: m ? 0.44 : 0.8, ry: 0.5, opacity: m ? 0.8 : 1 }),
    gallery: k({ seq: 4, x: m ? 0.3 : 0.62, y: m ? 0.3 : 0.1, s: m ? 0.4 : 0.7, ry: 1.2, opacity: 0.08 }),
    shop: k({ seq: 5, dark: 1, aShop: 1, plane: 1, wind: 0.5 }),
    steps: k({ seq: 6, x: m ? 0.2 : 0.38, y: m ? 0.5 : 0.52, s: m ? 0.5 : 0.75, rz: 0.2, opacity: 0.4, wind: 0.5 }),
    booking: k({ seq: 6, x: m ? -0.2 : -0.6, y: m ? 0.6 : 0.3, s: m ? 0.5 : 0.8, rz: -0.25, opacity: 0.18, wind: 0.6 }),
    footer: k({ seq: 7, dark: 1, aFooter: 1, wind: 0.4 }),
  };
}

interface Segment { st: ST; from: K; to: K; startFn?: () => number; endFn?: () => number }

export interface HairScene {
  /** Handoff preloader → hero. */
  intro(gsap: typeof import('gsap').gsap, onLand?: () => void): Promise<void>;
  skipIntro(): void;
  destroy(): void;
}

function sampleCurve(path: SVGPathElement, n: number) {
  const len = path.getTotalLength();
  const pts: Vector3[] = [];
  for (let i = 0; i < n; i++) {
    const p = path.getPointAtLength((i / (n - 1)) * len);
    pts.push(new Vector3(((p.x - 200) / 400) * 6, (-(p.y - 55) / 400) * 6, 0));
  }
  return pts;
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export async function createHairScene(opts: {
  host: HTMLElement;
  mobile: boolean;
  gsap: typeof import('gsap').gsap;
  ScrollTrigger: typeof ST;
  getScroll: () => number;
}): Promise<HairScene> {
  const { host, mobile, gsap, ScrollTrigger, getScroll } = opts;
  const curvePath = document.querySelector<SVGPathElement>('.swoosh__center');
  if (!curvePath) throw new Error('No hay trazo para muestrear');

  const stage = new Stage(host, { mobile });
  const strands = mobile ? 520 : 1700;
  const hair = new HairField({ strands, segments: mobile ? 40 : 56, curve: sampleCurve(curvePath, 64) });

  const rig = new Group();
  rig.add(hair.mesh);
  stage.scene.add(rig);

  // Producto destacado como plano real de la escena: el mechón pasa por delante y por detrás
  const productDom = document.querySelector('[data-product-dom] svg, [data-product-dom] img');
  const plane = await ProductPlane.from(productDom);
  if (plane) rig.add(plane.mesh);

  const K = frames(mobile);
  const anchors = {
    logo: () => document.querySelector('[data-preloader] .preloader__swoosh') ?? document.querySelector('.hero__fallback svg'),
    shop: () => document.querySelector('[data-product-stage]'),
    footer: () => document.querySelector('.footer__swoosh'),
  };

  // ---------- Tramos de scroll ----------
  const segs: Segment[] = [];
  const seg = (vars: ScrollTrigger.Vars, from: K, to: K) => {
    if (!vars.trigger || !document.querySelector(vars.trigger as string)) return;
    segs.push({ st: ScrollTrigger.create(vars), from, to });
  };
  seg({ trigger: '#manifiesto', start: 'top bottom', end: 'top 15%' }, K.hero, K.manifesto);

  const pin = registry.servicesPin;
  if (pin && !mobile) {
    seg({ trigger: '[data-services-stage]', start: 'top bottom', end: 'top top' }, K.manifesto, K.updo);
    const at = (a: number) => () => pin.start + (pin.end - pin.start) * a;
    seg({ trigger: '[data-services-stage]', start: at(0.27), end: at(0.45) }, K.updo, K.straight);
    seg({ trigger: '[data-services-stage]', start: at(0.6), end: at(0.78) }, K.straight, K.braid);
  } else {
    seg({ trigger: '[data-chapter="updo"]', start: 'top bottom', end: 'top 35%' }, K.manifesto, K.updo);
    seg({ trigger: '[data-chapter="straight"]', start: 'top 85%', end: 'top 35%' }, K.updo, K.straight);
    seg({ trigger: '[data-chapter="braid"]', start: 'top 85%', end: 'top 35%' }, K.straight, K.braid);
  }
  seg({ trigger: '#trabajos', start: 'top 75%', end: 'top 15%' }, K.braid, K.gallery);
  seg({ trigger: '#productos', start: 'top 90%', end: 'top 10%' }, K.gallery, K.shop);
  seg({ trigger: '#turnos', start: 'top 95%', end: 'top 35%' }, K.shop, K.steps);
  seg({ trigger: '#reservar', start: 'top 80%', end: 'top 20%' }, K.steps, K.booking);
  seg({ trigger: '.footer', start: 'top 95%', end: 'top 5%' }, K.booking, K.footer);
  segs.sort((a, b) => a.st.start - b.st.start);

  const scrollState = (y: number, out: K) => {
    let cur: K = K.hero;
    for (const s of segs) {
      if (y >= s.st.end) { cur = s.to; continue; }
      if (y > s.st.start) {
        const p = easeInOut((y - s.st.start) / Math.max(1, s.st.end - s.st.start));
        for (const key of KEYS) out[key] = s.from[key] + (s.to[key] - s.from[key]) * p;
        return out;
      }
      break;
    }
    Object.assign(out, cur);
    return out;
  };

  // ---------- Estado ----------
  const target = { ...K.hero };
  const cur = { ...K.pre };
  const intro = { blend: 0, fade: 0 };
  const ivory = new Color('#f7f2ec');
  const ink = new Color('#1c1410');
  const bg = new Color();
  const pointer = { x: 99, y: 99, vx: 0, vy: 0, strength: 0, lastX: 0, lastY: 0, active: false };

  const onMove = (e: PointerEvent) => {
    const wx = (e.clientX / stage.size.w - 0.5) * stage.view.w;
    const wy = -(e.clientY / stage.size.h - 0.5) * stage.view.h;
    if (pointer.active) {
      pointer.vx += (wx - pointer.lastX) * 0.6;
      pointer.vy += (wy - pointer.lastY) * 0.6;
      const speed = Math.hypot(wx - pointer.lastX, wy - pointer.lastY);
      pointer.strength = Math.min(1, pointer.strength + speed * 2.2);
    }
    pointer.lastX = wx; pointer.lastY = wy; pointer.active = true;
  };
  if (!mobile) window.addEventListener('pointermove', onMove, { passive: true });

  const onResize = () => stage.resize();
  window.addEventListener('resize', onResize);

  const rectOf = (el: Element | null) => (el ? stage.rectToWorld(el.getBoundingClientRect()) : null);

  // ---------- Calidad adaptativa ----------
  let frameCount = 0, frameAcc = 0, measured = false;

  let time = 0;
  const tick = (_t: number, deltaMs: number) => {
    const dt = Math.min(deltaMs / 1000, 0.1);
    time += dt;

    // estado objetivo: scroll, mezclado con el intro
    scrollState(getScroll(), target);
    if (intro.blend < 1) {
      for (const key of KEYS) target[key] = K.pre[key] + (target[key] - K.pre[key]) * intro.blend;
    }
    const damp = 1 - Math.exp(-dt * 5.5);
    for (const key of KEYS) cur[key] += (target[key] - cur[key]) * damp;
    // el ancla del preloader solo existe durante el intro; los pesos residuales se anulan
    if (intro.blend >= 1) cur.aLogo = 0;
    if (cur.aShop < 0.002) cur.aShop = 0;
    if (cur.aFooter < 0.002) cur.aFooter = 0;

    // ancla y posición
    const kx = cur.x * (stage.view.w / 2);
    const ky = cur.y * (stage.view.h / 2);
    const ks = (cur.s * stage.view.h) / 6;
    let px = kx, py = ky, ps = ks;
    const wsum = Math.min(1, cur.aLogo + cur.aShop + cur.aFooter);
    if (wsum > 0.001) {
      let ax = 0, ay = 0, as = 0;
      const add = (w: number, r: ReturnType<typeof rectOf>, scale: (r: NonNullable<ReturnType<typeof rectOf>>) => number) => {
        if (w <= 0.001 || !r) return;
        ax += r.x * w; ay += r.y * w; as += scale(r) * w;
      };
      add(cur.aLogo, rectOf(anchors.logo()), (r) => r.w / 6);
      add(cur.aShop, rectOf(anchors.shop()), (r) => r.h / 5.6);
      add(cur.aFooter, rectOf(anchors.footer()), (r) => r.w / 6);
      const tw = cur.aLogo + cur.aShop + cur.aFooter;
      if (tw > 0) { ax /= tw; ay /= tw; as /= tw; }
      px = kx * (1 - wsum) + ax * wsum;
      py = ky * (1 - wsum) + ay * wsum;
      ps = ks * (1 - wsum) + as * wsum;
    }
    const idle = 1 - wsum;
    rig.position.set(px, py, 0);
    rig.scale.setScalar(ps);
    rig.rotation.set(
      cur.rx + Math.sin(time * 0.25) * 0.05 * idle,
      cur.ry + Math.sin(time * 0.18) * 0.12 * idle + (cur.seq > 3.5 && cur.seq < 4.5 ? time * 0.15 : 0) * idle,
      cur.rz,
    );

    // uniforms
    const u = hair.uniforms;
    hair.setSequence(cur.seq, SEQ);
    u.uTime.value = time;
    u.uWind.value = cur.wind;
    u.uOpacity.value = cur.opacity * intro.fade;
    u.uDark.value = cur.dark;
    u.uShine.value = cur.shine;
    u.uSweep.value = cur.shine > 0.02 ? ((time * 0.32) % 1.6) - 0.3 : -1;
    // ancho en unidades de mundo (se aplica en view space, no lo afecta la escala del rig)
    u.uPx.value = stage.pxFactor;
    u.uWidth.value = 0.0095 * Math.min(1.3, Math.max(0.55, ps / (stage.view.h / 6)));

    // puntero (decae solo)
    pointer.vx *= 0.9; pointer.vy *= 0.9;
    pointer.strength *= 0.96;
    (u.uPointer.value as Vector3).set(pointer.lastX, pointer.lastY, 0);
    u.uPointerVel.value.set(pointer.vx, pointer.vy);
    u.uPointerStrength.value = pointer.strength * (1 - cur.aLogo) * cur.opacity;

    if (plane) {
      plane.opacity = cur.plane * intro.fade;
      plane.mesh.rotation.y = Math.sin(time * 0.5) * 0.12;
      plane.mesh.position.y = -0.1 + Math.sin(time * 0.8) * 0.04;
    }

    // fondo de página: marfil ↔ espresso
    bg.copy(ivory).lerp(ink, cur.dark);
    document.body.style.backgroundColor = `#${bg.getHexString()}`;
    document.documentElement.classList.toggle('is-dark-bg', cur.dark > 0.5);

    if (u.uOpacity.value > 0.004 || (plane && plane.mesh.visible)) stage.render();

    // medir fps una vez que el intro terminó
    if (!measured && intro.blend >= 1) {
      frameCount++; frameAcc += dt;
      if (frameCount === 90) {
        const fps = frameCount / frameAcc;
        if (fps < 42) hair.setCount(strands * (fps < 28 ? 0.4 : 0.65));
        measured = true;
      }
    }
  };
  gsap.ticker.add(tick);
  if (location.search.includes('debug')) (window as any).__mdp = { hair, rig, cur, target, stage, intro, plane };

  ScrollTrigger.refresh();
  host.classList.add('is-ready');
  document.documentElement.classList.add('gl-on');

  return {
    intro(g, onLand) {
      return new Promise((resolve) => {
        const tl = g.timeline({ onComplete: () => resolve() });
        tl.to(intro, { fade: 1, duration: 0.7, ease: 'power2.out' })
          .to(intro, { blend: 1, duration: 2.6, ease: 'expo.inOut', onStart: () => onLand?.() }, '+=0.1');
      });
    },
    skipIntro() {
      intro.blend = 1;
      Object.assign(cur, K.hero);
      gsap.to(intro, { fade: 1, duration: 1.2, ease: 'power2.out' });
    },
    destroy() {
      gsap.ticker.remove(tick);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', onResize);
      segs.forEach((s) => s.st.kill());
      hair.dispose();
      stage.dispose();
    },
  };
}
