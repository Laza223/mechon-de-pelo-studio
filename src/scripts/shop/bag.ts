import { gsap } from 'gsap';
import { sendWhatsApp } from './contact';
import { toast } from '../motion/toast';
import { registry } from '../motion/registry';

type Item = { id: string; name: string; brand: string; slug: string };
const KEY = 'mdp-bag';

function read(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
}
function write(b: Record<string, number>) {
  try { localStorage.setItem(KEY, JSON.stringify(b)); } catch {}
}

export function buildBagMessage(items: { item: Item; qty: number }[]) {
  const lines = items.map(({ item, qty }) => `• ${qty} × ${item.name}${item.brand ? ` (${item.brand})` : ''}`);
  return `Hola Mechón de Pelo 🤎 Quería consultar por estos productos:\n${lines.join('\n')}\n\n¿Tienen stock? ¿Cómo coordinamos el pago y la entrega? ¡Gracias!`;
}

export function initBag() {
  const root = document.querySelector<HTMLElement>('[data-bag]');
  if (!root) return;
  const catalog: Item[] = JSON.parse(document.getElementById('bag-catalog')?.textContent || '[]');
  const byId = new Map(catalog.map((i) => [i.id, i]));
  const list = root.querySelector<HTMLElement>('[data-bag-list]')!;
  const empty = root.querySelector<HTMLElement>('[data-bag-empty]')!;
  const foot = root.querySelector<HTMLElement>('[data-bag-foot]')!;
  const panel = root.querySelector<HTMLElement>('.bag__panel')!;
  let bag = read();
  let lastFocus: HTMLElement | null = null;

  const entries = () => Object.entries(bag).filter(([id, q]) => q > 0 && byId.has(id)).map(([id, qty]) => ({ item: byId.get(id)!, qty }));

  const render = () => {
    const items = entries();
    const count = items.reduce((a, b) => a + b.qty, 0);
    document.querySelectorAll<HTMLElement>('[data-bag-count]').forEach((el) => {
      el.textContent = String(count);
      el.classList.toggle('has-items', count > 0);
    });
    empty.hidden = items.length > 0;
    foot.hidden = items.length === 0;
    list.innerHTML = '';
    for (const { item, qty } of items) {
      const li = document.createElement('li');
      li.className = 'bag-item';
      li.innerHTML = `
        <div><p class="bag-item__brand"></p><a class="bag-item__name" href="/productos/${item.slug}"></a></div>
        <div class="bag-item__qty" role="group">
          <button type="button" data-dec aria-label="Quitar uno"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M5 12h14"/></svg></button>
          <output aria-live="polite">${qty}</output>
          <button type="button" data-inc aria-label="Sumar uno"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M12 5v14M5 12h14"/></svg></button>
        </div>`;
      li.querySelector('.bag-item__brand')!.textContent = item.brand;
      li.querySelector('.bag-item__name')!.textContent = item.name;
      li.querySelector('[data-dec]')!.addEventListener('click', () => set(item.id, qty - 1));
      li.querySelector('[data-inc]')!.addEventListener('click', () => set(item.id, qty + 1));
      list.appendChild(li);
    }
  };

  const set = (id: string, qty: number) => {
    if (qty <= 0) delete bag[id];
    else bag[id] = Math.min(qty, 20);
    write(bag);
    render();
  };

  const open = () => {
    lastFocus = document.activeElement as HTMLElement;
    root.hidden = false;
    requestAnimationFrame(() => root.classList.add('is-open'));
    registry.lenis?.stop();
    panel.focus();
  };
  const close = () => {
    root.classList.remove('is-open');
    registry.lenis?.start();
    setTimeout(() => { root.hidden = true; lastFocus?.focus(); }, 650);
  };

  document.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    const add = t.closest<HTMLButtonElement>('[data-bag-add]');
    if (add && !add.disabled) {
      const id = add.dataset.bagAdd!;
      set(id, (bag[id] || 0) + 1);
      const item = byId.get(id);
      add.classList.add('is-added');
      setTimeout(() => add.classList.remove('is-added'), 1200);
      // el header vuelve a aparecer para que la bolsita quede a mano
      document.querySelector('[data-header]')?.classList.remove('is-hidden');
      const badge = document.querySelector('.header__bag');
      if (badge) gsap.fromTo(badge, { scale: 1 }, { scale: 1.18, duration: 0.18, yoyo: true, repeat: 1, ease: 'power2.out' });
      toast(`${item?.name ?? 'Producto'} se sumó a tu consulta`, 4200, { label: 'Ver consulta', onClick: open });
      return;
    }
    if (t.closest('[data-bag-open]')) { open(); return; }
    if (t.closest('[data-bag-close]') && root.classList.contains('is-open')) { close(); return; }
    if (t.closest('[data-bag-clear]')) { bag = {}; write(bag); render(); return; }
    if (t.closest('[data-bag-send]')) { sendWhatsApp(buildBagMessage(entries())); }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && root.classList.contains('is-open')) close();
  });
  window.addEventListener('storage', (e) => { if (e.key === KEY) { bag = read(); render(); } });
  render();
}
