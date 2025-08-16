import { api } from './api';

export async function criarReceita(body: {
  pacienteId: string;
  evolucaoId?: string;
  itens: { medicamento: string; posologia: string; quantidade?: string }[];
  observacoes?: string;
  assinaturaImagemBase64?: string;
}) {
  const { data } = await api.post('/documentos/receita', body);
  return data; // retorna o registro do documento (sem URL)
}

export async function urlDocumento(id: string) {
  const { data } = await api.get<{ url: string; expires: number }>(`/documentos/${id}/url`);
  return data;
}
