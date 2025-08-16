import api from '../lib/api';

export interface Atendimento {
  id: string;
  patientId: string;
  professionalId: string;
  serviceDate: string;
  startedAt: string;
  finishedAt?: string;
  status: 'EM_ANDAMENTO' | 'FINALIZADO' | 'CANCELADO';
  dayHash?: string;
  evolucoes: Evolucao[];
  sinaisVitais: SinaisVitais[];
  anexos: Anexo[];
  profissional: {
    id: string;
    nome: string;
  };
}

export interface Evolucao {
  id: string;
  atendimentoId: string;
  authorId: string;
  resumo?: string;
  texto: string;
  registradoEm: string;
  locked: boolean;
  currentVersion: number;
}

export interface SinaisVitais {
  id: string;
  atendimentoId: string;
  usuarioId?: string;
  registradoEm: string;
  pressaoSistolica: number;
  pressaoDiastolica: number;
  frequenciaCardiaca: number;
  frequenciaRespiratoria: number;
  saturacaoOxigenio: number;
  temperatura: number;
  peso?: number;
  altura?: number;
  observacoes?: string;
}

export interface Anexo {
  id: string;
  atendimentoId: string;
  filename: string;
  mimeType: string;
  size: number;
  storageKey: string;
  urlPublica?: string;
  titulo?: string;
  tipoDocumento?: string;
  createdAt: string;
}

export interface CreateEvolucaoData {
  resumo?: string;
  texto: string;
  when?: string;
}

export interface UpdateEvolucaoData {
  resumo?: string;
  texto: string;
}

export interface CreateSinaisVitaisData {
  pressaoSistolica: number;
  pressaoDiastolica: number;
  frequenciaCardiaca: number;
  frequenciaRespiratoria: number;
  saturacaoOxigenio: number;
  temperatura: number;
  peso?: number;
  altura?: number;
  observacoes?: string;
  when?: string;
}

export interface CreateAnexoData {
  filename: string;
  mimeType: string;
  size: number;
  storageKey: string;
  urlPublica?: string;
  titulo?: string;
  tipoDocumento?: string;
  when?: string;
}

export interface EvolucaoVersion {
  id: string;
  evolucaoId: string;
  version: number;
  resumo?: string;
  texto: string;
  changedAt: string;
  changedBy: string;
  changedByUser: {
    id: string;
    nome: string;
  };
}

export const atendimentosService = {
  // Listar atendimentos de um paciente
  listPatientAtendimentos: async (patientId: string, from?: string, to?: string) => {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    
    const response = await api.get<Atendimento[]>(`/atendimentos/patients/${patientId}?${params}`);
    return response.data;
  },

  // Criar evolução
  createEvolucao: async (patientId: string, data: CreateEvolucaoData) => {
    const response = await api.post<Evolucao>(`/atendimentos/patients/${patientId}/evolucoes`, data);
    return response.data;
  },

  // Atualizar evolução
  updateEvolucao: async (evolucaoId: string, data: UpdateEvolucaoData) => {
    const response = await api.put<Evolucao>(`/atendimentos/evolucoes/${evolucaoId}`, data);
    return response.data;
  },

  // Criar sinais vitais
  createSinaisVitais: async (patientId: string, data: CreateSinaisVitaisData) => {
    const response = await api.post<SinaisVitais>(`/atendimentos/patients/${patientId}/sinais-vitais`, data);
    return response.data;
  },

  // Criar anexo
  createAnexo: async (patientId: string, data: CreateAnexoData) => {
    const response = await api.post<Anexo>(`/atendimentos/patients/${patientId}/anexos`, data);
    return response.data;
  },

  // Finalizar atendimento
  finalizarAtendimento: async (atendimentoId: string) => {
    const response = await api.post<{ success: boolean; dayHash: string }>(`/atendimentos/${atendimentoId}/finalizar`);
    return response.data;
  },

  // Obter histórico de versões de uma evolução
  getEvolucaoVersions: async (evolucaoId: string) => {
    const response = await api.get<EvolucaoVersion[]>(`/atendimentos/evolucoes/${evolucaoId}/versions`);
    return response.data;
  },
};
