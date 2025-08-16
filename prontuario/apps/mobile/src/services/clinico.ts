import { api } from './api';

export async function alergiasPorPaciente(pacienteId: string){ const { data } = await api.get(`/alergias/por-paciente/${pacienteId}`); return data; }
export async function criarAlergia(payload: any){ const { data } = await api.post('/alergias', payload); return data; }
export async function removerAlergia(id: string){ const { data } = await api.delete(`/alergias/${id}`); return data; }

export async function medicacoesPorPaciente(pacienteId: string){ const { data } = await api.get(`/medicacoes/por-paciente/${pacienteId}`); return data; }
export async function criarMedicacao(payload: any){ const { data } = await api.post('/medicacoes', payload); return data; }
export async function removerMedicacao(id: string){ const { data } = await api.delete(`/medicacoes/${id}`); return data; }

export async function problemasPorPaciente(pacienteId: string){ const { data } = await api.get(`/problemas/por-paciente/${pacienteId}`); return data; }
export async function criarProblema(payload: any){ const { data } = await api.post('/problemas', payload); return data; }
export async function removerProblema(id: string){ const { data } = await api.delete(`/problemas/${id}`); return data; }
