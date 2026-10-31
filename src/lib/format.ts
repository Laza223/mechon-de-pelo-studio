const nf = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

/** $35.000 — mismo formato que usa la marca en sus historias. */
export const ars = (n: number) => `$${nf.format(n)}`;

export function priceLabel(priceType: string, price?: number) {
  if (priceType === 'consultar' || price == null) return { prefix: '', value: 'Consultá el precio' };
  if (priceType === 'desde') return { prefix: 'Desde', value: ars(price) };
  return { prefix: 'Precio fijo', value: ars(price) };
}

export const stockLabel: Record<string, string> = {
  disponible: 'Disponible',
  consultar: 'Consultar stock',
  agotado: 'Agotado',
};
