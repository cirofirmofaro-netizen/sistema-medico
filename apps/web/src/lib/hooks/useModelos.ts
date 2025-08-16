import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../api';
import type { ModeloPlantao, CreateModeloPlantaoDto } from '../types';

// Chaves de cache
const MODELOS_KEYS = {
  all: ['modelos'] as const,
  lists: () => [...MODELOS_KEYS.all, 'list'] as const,
  list: () => [...MODELOS_KEYS.lists()] as const,
  details: () => [...MODELOS_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...MODELOS_KEYS.details(), id] as const,
};

// API functions
const modelosAPI = {
  // Listar todos os modelos
  list: async (): Promise<ModeloPlantao[]> => {
    const response = await api.get('/modelos-plantoes');
    return response.data;
  },

  // Buscar modelo por ID
  getById: async (id: string): Promise<ModeloPlantao> => {
    const response = await api.get(`/modelos-plantoes/${id}`);
    return response.data;
  },

  // Criar modelo
  create: async (data: CreateModeloPlantaoDto): Promise<ModeloPlantao> => {
    const response = await api.post('/modelos-plantoes', data);
    return response.data;
  },

  // Atualizar modelo
  update: async ({ id, data }: { id: string; data: Partial<CreateModeloPlantaoDto> }): Promise<ModeloPlantao> => {
    const response = await api.patch(`/modelos-plantoes/${id}`, data);
    return response.data;
  },

  // Deletar modelo
  delete: async (id: string): Promise<void> => {
    await api.delete(`/modelos-plantoes/${id}`);
  },

  // Gerar ocorrências por modelo
  gerarOcorrencias: async ({ id, start, end }: { id: string; start: string; end: string }): Promise<any> => {
    const response = await api.post(`/modelos-plantoes/${id}/gerar-ocorrencias`, { start, end });
    return response.data;
  },
};

// Hooks
export const useModelos = () => {
  return useQuery({
    queryKey: MODELOS_KEYS.list(),
    queryFn: modelosAPI.list,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

export const useModelo = (id: string) => {
  return useQuery({
    queryKey: MODELOS_KEYS.detail(id),
    queryFn: () => modelosAPI.getById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
};

// Mutations
export const useCreateModelo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: modelosAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MODELOS_KEYS.lists() });
      toast.success('Modelo de plantão criado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar modelo de plantão');
    },
  });
};

export const useUpdateModelo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: modelosAPI.update,
    onSuccess: (data) => {
      // Optimistic update
      queryClient.setQueryData(MODELOS_KEYS.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: MODELOS_KEYS.lists() });
      toast.success('Modelo de plantão atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar modelo de plantão');
    },
  });
};

export const useDeleteModelo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: modelosAPI.delete,
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: MODELOS_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: MODELOS_KEYS.lists() });
      toast.success('Modelo de plantão excluído com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao excluir modelo de plantão');
    },
  });
};

export const useGerarOcorrencias = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: modelosAPI.gerarOcorrencias,
    onSuccess: (data) => {
      // Invalidate plantões list since new ones were created
      queryClient.invalidateQueries({ queryKey: ['plantoes'] });
      toast.success(`Geradas ${data.ocorrencias?.length || 0} ocorrências com sucesso!`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao gerar ocorrências');
    },
  });
};
