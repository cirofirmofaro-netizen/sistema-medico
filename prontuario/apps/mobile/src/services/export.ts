import { api } from './api';

export async function exportarProntuario(body: { pacienteId: string; from?: string; to?: string; incluirAnexos?: boolean }) {
  const { data } = await api.post<{ tipo: 'PDF'|'ZIP'; url: string; expires: number }>(`/export/prontuario`, body);
  return data;
}
