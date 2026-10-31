let timer: number | undefined;

/** Aviso flotante. Opcionalmente con una acción (ej. "Ver consulta"). */
export function toast(message: string, ms = 3600, action?: { label: string; onClick: () => void }) {
  const el = document.querySelector<HTMLElement>('[data-toast]');
  if (!el) return;
  el.replaceChildren(document.createTextNode(message));
  if (action) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'toast__action';
    b.textContent = action.label;
    b.addEventListener('click', () => { el.classList.remove('is-visible'); action.onClick(); });
    el.append(b);
  }
  el.classList.add('is-visible');
  window.clearTimeout(timer);
  timer = window.setTimeout(() => el.classList.remove('is-visible'), ms);
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
