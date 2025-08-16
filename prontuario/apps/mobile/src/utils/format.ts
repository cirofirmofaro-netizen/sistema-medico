export const moneyBR = (v: number | null | undefined) =>
  typeof v === 'number'
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
    : '—';

// "1.234,56" -> 1234.56
export const parseMoneyBR = (s: string) => {
  if (!s) return 0;
  return Number(s.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '')) || 0;
};

export const dt = (iso?: string) => (iso ? new Date(iso).toLocaleString('pt-BR') : '—');
