import { gsap } from 'gsap';
import { sendInstagram, sendWhatsApp, contactConfig } from '../shop/contact';
import { canPrefill, whatsappUrl } from '../../lib/links';

const fmtDate = (v: string) => {
  if (!v) return '';
  const [y, m, d] = v.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
};

export function buildBookingMessage(f: Record<string, string>, deposit: boolean) {
  const lines = [`Hola Mechón de Pelo 🤎 Soy ${f.name || '…'} y quería consultar por un turno.`, ''];
  lines.push(`• Servicio: ${f.service}`);
  if (f.occasion) lines.push(`• Ocasión: ${f.occasion}`);
  if (f.length) lines.push(`• Largo de pelo: ${f.length}`);
  if (f.place) lines.push(`• Modalidad: ${f.place}`);
  const when = [fmtDate(f.date), f.slot].filter(Boolean).join(' · ');
  if (when) lines.push(`• Preferencia: ${when}`);
  if (f.notes) lines.push(`• Comentario: ${f.notes}`);
  if (deposit) lines.push('', 'Sé que para trenzas se pide seña 🙂');
  lines.push('', '¿Qué disponibilidad tienen? ¡Gracias!');
  return lines.join('\n');
}

export function initWizard() {
  const form = document.querySelector<HTMLFormElement>('[data-wizard]');
  if (!form) return;
  const steps = [...form.querySelectorAll<HTMLElement>('[data-step]')];
  const dots = [...form.querySelectorAll<HTMLElement>('[data-dot]')];
  const prev = form.querySelector<HTMLButtonElement>('[data-prev]')!;
  const next = form.querySelector<HTMLButtonElement>('[data-next]')!;
  const send = form.querySelector<HTMLElement>('[data-send]')!;
  const waBtn = form.querySelector<HTMLAnchorElement>('[data-send-wa]')!;
  const igBtn = form.querySelector<HTMLAnchorElement>('[data-send-ig]')!;
  const preview = form.querySelector<HTMLElement>('[data-preview]')!;
  const depositNote = form.querySelector<HTMLElement>('[data-deposit-note]')!;
  const onlyPeinados = form.querySelector<HTMLElement>('[data-only="peinados"]')!;
  const nameErr = form.querySelector<HTMLElement>('[data-error-name]')!;
  const date = form.querySelector<HTMLInputElement>('input[type="date"]');
  if (date) date.min = new Date().toISOString().slice(0, 10);
  let i = 0;

  const values = () => {
    const fd = new FormData(form);
    const v: Record<string, string> = {};
    fd.forEach((val, key) => { v[key] = String(val).trim(); });
    return v;
  };
  const selected = () => form.querySelector<HTMLInputElement>('input[name="service"]:checked');

  const update = () => {
    const sel = selected();
    const cat = sel?.dataset.cat;
    const deposit = sel?.dataset.deposit === '1';
    onlyPeinados.hidden = cat !== 'peinados';
    if (cat !== 'peinados') onlyPeinados.querySelectorAll('input').forEach((x) => (x.checked = false));
    depositNote.hidden = !deposit;
    const msg = buildBookingMessage(values(), deposit);
    preview.textContent = msg;
    const c = contactConfig();
    waBtn.href = canPrefill(c) ? whatsappUrl(c, msg) : c.whatsappLink;
    return msg;
  };

  const go = (to: number) => {
    const from = steps[i];
    const target = steps[to];
    const dir = to > i ? 1 : -1;
    i = to;
    update();
    gsap.to(from, {
      autoAlpha: 0, x: -30 * dir, duration: 0.35, ease: 'power2.in',
      onComplete: () => {
        from.hidden = true;
        target.hidden = false;
        gsap.fromTo(target, { autoAlpha: 0, x: 30 * dir }, { autoAlpha: 1, x: 0, duration: 0.6, ease: 'expo.out' });
        target.querySelector<HTMLElement>('legend')?.focus?.();
      },
    });
    dots.forEach((d, n) => d.classList.toggle('is-done', n <= to));
    prev.hidden = to === 0;
    next.hidden = to === steps.length - 1;
    send.hidden = to !== steps.length - 1;
  };

  next.addEventListener('click', () => { if (i < steps.length - 1) go(i + 1); });
  prev.addEventListener('click', () => { if (i > 0) go(i - 1); });
  form.addEventListener('input', (e) => {
    if ((e.target as HTMLInputElement).name === 'name') nameErr.hidden = true;
    update();
  });
  form.addEventListener('change', update);
  form.addEventListener('submit', (e) => e.preventDefault());

  const validName = () => {
    const ok = Boolean(values().name);
    nameErr.hidden = ok;
    if (!ok) form.querySelector<HTMLInputElement>('input[name="name"]')?.focus();
    return ok;
  };
  waBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (!validName()) return;
    sendWhatsApp(update());
  });
  igBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (!validName()) return;
    sendInstagram(update());
  });

  dots[0]?.classList.add('is-done');
  update();
}
