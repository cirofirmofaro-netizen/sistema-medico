import { api } from './api';

export type Anexo = {
  id: string; evolucaoId: string; filename: string; mimeType: string; size: number;
  storageKey: string; urlPublica?: string | null; createdAt: string;
};

export async function listarAnexos(evolucaoId: string) {
  const { data } = await api.get<Anexo[]>(`/anexos/por-evolucao/${evolucaoId}`);
  return data;
}

export async function presign(evolucaoId: string, args: { filename: string; mimeType: string; size: number }) {
  const { data } = await api.post<{ uploadUrl: string; storageKey: string }>(`/anexos/presign?evolucaoId=${evolucaoId}`, args);
  return data;
}

export async function finalize(evolucaoId: string, body: { filename: string; mimeType: string; size: number; storageKey: string; urlPublica?: string }) {
  const { data } = await api.post<Anexo>(`/anexos/finalize?evolucaoId=${evolucaoId}`, body);
  return data;
}

export async function getDownloadUrl(anexoId: string) {
  const { data } = await api.get<{ url: string; expires: number }>(`/anexos/${anexoId}/url`);
  return data;
}
