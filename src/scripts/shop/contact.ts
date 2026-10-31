import { whatsappUrl, igDirect, canPrefill, type ContactConfig } from '../../lib/links';
import { copyText, toast } from '../motion/toast';

export function contactConfig(): ContactConfig {
  const b = document.body.dataset;
  return {
    whatsappNumber: b.waNumber || undefined,
    whatsappLink: b.waLink || 'https://wa.me/message/ZM5LQWOPSHXKN1',
    instagramHandle: b.ig || 'mechondepelo.studio',
  };
}

/** Abre WhatsApp con el mensaje. Si no hay número para precargarlo, lo copia y avisa. */
export async function sendWhatsApp(message: string) {
  const c = contactConfig();
  if (canPrefill(c)) {
    window.open(whatsappUrl(c, message), '_blank', 'noopener');
    return;
  }
  // copiar arranca mientras la página tiene foco; abrir va sincrónico (si no, Safari bloquea el popup)
  const copied = copyText(message);
  window.open(c.whatsappLink, '_blank', 'noopener');
  const ok = await copied;
  toast(ok ? 'Copiamos tu mensaje 🤎 Pegalo en el chat de WhatsApp.' : 'Abrimos WhatsApp: contanos qué necesitás 🤎', 5000);
}

export async function sendInstagram(message: string) {
  const copied = copyText(message);
  window.open(igDirect(contactConfig()), '_blank', 'noopener');
  const ok = await copied;
  toast(ok ? 'Copiamos tu mensaje 🤎 Pegalo en el chat de Instagram.' : 'Abrimos Instagram: escribinos por DM 🤎', 5000);
}
