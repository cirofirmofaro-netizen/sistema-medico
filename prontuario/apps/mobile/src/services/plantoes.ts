import { api } from './api';

export type Plantao = {
  id: string; inicio: string; fim: string; local: string;
  contratante: string; tipo: string; valorBruto: number;
  valorLiquido?: number | null; statusPgto: 'PENDENTE'|'PAGO'|'PARCIAL'|'ATRASADO';
  notas?: string | null;
};

type ListResponse<T> = { items: T[]; total: number };

export async function listPlantoes() {
  const { data } = await api.get<ListResponse<Plantao>>('/plantoes');
  return data.items; // <- devolve só o array
}

export async function listPlantoesFiltered(params?: {
  from?: string; to?: string; contratante?: string; tipo?: string;
  statusPgto?: 'PENDENTE'|'PAGO'|'PARCIAL'|'ATRASADO';
}) {
  const { data } = await api.get<ListResponse<Plantao>>('/plantoes', { params });
  return data.items;
}

export async function createPlantao(payload: Partial<Plantao>) {
  const { data } = await api.post<Plantao>('/plantoes', payload);
  return data;
}

export async function getPlantao(id: string) {
  const { data } = await api.get<Plantao>(`/plantoes/${id}`);
  return data;
}

export async function registrarPagamento(id: string, payload: { valorPago: number; dtPgto?: string; comprovanteKey?: string; obs?: string; }) {
  const { data } = await api.post(`/plantoes/${id}/pagamentos`, payload);
  return data;
}
