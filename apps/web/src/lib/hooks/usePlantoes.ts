import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../api';
import type { 
  Plantao, 
  CreatePlantaoDto, 
  PlantaoFilters, 
  ResumoPlantoes,
  TrocaPlantaoFormData 
} from '../types';

// Chaves de cache
const PLANTÕES_KEYS = {
  all: ['plantoes'] as const,
  lists: () => [...PLANTÕES_KEYS.all, 'list'] as const,
  list: (filters: PlantaoFilters) => [...PLANTÕES_KEYS.lists(), filters] as const,
  details: () => [...PLANTÕES_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...PLANTÕES_KEYS.details(), id] as const,
  resumo: () => [...PLANTÕES_KEYS.all, 'resumo'] as const,
};

// API functions
const plantoesAPI = {
  // Listar plantões com filtros
  list: async (filters?: PlantaoFilters): Promise<Plantao[]> => {
    const params = new URLSearchParams();
    if (filters?.from) params.append('from', filters.from);
    if (filters?.to) params.append('to', filters.to);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.fontePagadoraId) params.append('fontePagadoraId', filters.fontePagadoraId);
    
    const response = await api.get(`/plantoes?${params.toString()}`);
    return response.data;
  },

  // Buscar plantão por ID
  getById: async (id: string): Promise<Plantao> => {
    const response = await api.get(`/plantoes/${id}`);
    return response.data;
  },

  // Criar plantão avulso
  createAvulso: async (data: CreatePlantaoDto): Promise<Plantao> => {
    const response = await api.post('/plantoes/avulso', data);
    return response.data;
  },

  // Marcar plantão como realizado
  realizar: async (id: string): Promise<Plantao> => {
    const response = await api.patch(`/plantoes/${id}/realizar`);
    return response.data;
  },

  // Registrar troca de plantão
  troca: async (id: string, data: TrocaPlantaoFormData): Promise<Plantao> => {
    const response = await api.patch(`/plantoes/${id}/troca`, data);
    return response.data;
  },

  // Cancelar plantão
  cancelar: async (id: string): Promise<Plantao> => {
    const response = await api.delete(`/plantoes/${id}`);
    return response.data;
  },

  // Buscar resumo de plantões
  getResumo: async (ano?: number, mes?: number): Promise<ResumoPlantoes> => {
    const params = new URLSearchParams();
    if (ano) params.append('ano', ano.toString());
    if (mes) params.append('mes', mes.toString());
    
    const response = await api.get(`/plantoes/resumo?${params.toString()}`);
    return response.data;
  },
};

// Hooks
export const usePlantoes = (filters?: PlantaoFilters) => {
  return useQuery({
    queryKey: PLANTÕES_KEYS.list(filters || {}),
    queryFn: () => plantoesAPI.list(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

export const usePlantao = (id: string) => {
  return useQuery({
    queryKey: PLANTÕES_KEYS.detail(id),
    queryFn: () => plantoesAPI.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useResumoPlantoes = (ano?: number, mes?: number) => {
  return useQuery({
    queryKey: [...PLANTÕES_KEYS.resumo(), ano, mes],
    queryFn: () => plantoesAPI.getResumo(ano, mes),
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

// Mutations
export const useCreatePlantaoAvulso = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: plantoesAPI.createAvulso,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PLANTÕES_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: PLANTÕES_KEYS.resumo() });
      toast.success('Plantão criado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar plantão');
    },
  });
};

export const useRealizarPlantao = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: plantoesAPI.realizar,
    onSuccess: (data) => {
      // Optimistic update
      queryClient.setQueryData(PLANTÕES_KEYS.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: PLANTÕES_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: PLANTÕES_KEYS.resumo() });
      toast.success('Plantão marcado como realizado!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao marcar plantão como realizado');
    },
  });
};

export const useTrocaPlantao = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TrocaPlantaoFormData }) =>
      plantoesAPI.troca(id, data),
    onSuccess: (data) => {
      queryClient.setQueryData(PLANTÕES_KEYS.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: PLANTÕES_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: PLANTÕES_KEYS.resumo() });
      toast.success('Troca de plantão registrada!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao registrar troca');
    },
  });
};

export const useCancelarPlantao = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: plantoesAPI.cancelar,
    onSuccess: (data) => {
      queryClient.setQueryData(PLANTÕES_KEYS.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: PLANTÕES_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: PLANTÕES_KEYS.resumo() });
      toast.success('Plantão cancelado!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao cancelar plantão');
    },
  });
};
