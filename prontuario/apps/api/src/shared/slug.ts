/**
 * Converte uma string em slug (URL-friendly)
 * Remove acentos, converte para minúsculas, substitui espaços por hífens
 */
export function slugify(text: string): string {
  return text
    .normalize('NFD') // Normaliza caracteres Unicode
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove caracteres especiais exceto hífens
    .replace(/[\s_-]+/g, '-') // Substitui espaços e underscores por hífens
    .replace(/^-+|-+$/g, ''); // Remove hífens no início e fim
}

/**
 * Gera um nome de arquivo slugificado a partir do nome original
 * Mantém a extensão original
 */
export function slugifyFilename(filename: string): string {
  if (!filename || typeof filename !== 'string') {
    throw new Error('Filename é obrigatório e deve ser uma string');
  }
  
  const lastDotIndex = filename.lastIndexOf('.');
  
  if (lastDotIndex === -1) {
    // Arquivo sem extensão
    return slugify(filename);
  }
  
  const name = filename.substring(0, lastDotIndex);
  const extension = filename.substring(lastDotIndex);
  
  return `${slugify(name)}${extension}`;
}
