export const canonicalize = (s?: string) =>
  (s ?? '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
