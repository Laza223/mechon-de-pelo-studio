/** Links de contacto. Funciona igual en el server (Astro) y en el cliente. */
export interface ContactConfig {
  whatsappNumber?: string;
  whatsappLink: string;
  instagramHandle: string;
}

export const igProfile = (c: ContactConfig) => `https://instagram.com/${c.instagramHandle}`;
export const igDirect = (c: ContactConfig) => `https://ig.me/m/${c.instagramHandle}`;

/** True si podemos precargar el mensaje (wa.me/<número>?text=). */
export const canPrefill = (c: ContactConfig) => Boolean(c.whatsappNumber);

export function whatsappUrl(c: ContactConfig, message?: string) {
  if (c.whatsappNumber) {
    const num = c.whatsappNumber.replace(/\D/g, '');
    return `https://wa.me/${num}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
  }
  return c.whatsappLink;
}

export const defaultBookingMessage = 'Hola Mechón de Pelo 🤎 Quería consultar por un turno.';
