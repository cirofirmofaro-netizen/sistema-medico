import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../api';
import type { FontePagadora, CreateFontePagadoraDto } from '../types';

// Chaves de cache
const FONTES_KEYS = {
  all: ['fontes'] as const,
  lists: () => [...FONTES_KEYS.all, 'list'] as const,
  list: () => [...FONTES_KEYS.lists()] as const,
  ativas: () => [...FONTES_KEYS.all, 'ativas'] as const,
  details: () => [...FONTES_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...FONTES_KEYS.details(), id] as const,
};

// API functions
const fontesAPI = {
  // Listar todas as fontes
  list: async (): Promise<FontePagadora[]> => {
    const response = await api.get('/fontes-pagadoras');
    return response.data;
  },

  // Listar fontes ativas
  listAtivas: async (): Promise<FontePagadora[]> => {
    const response = await api.get('/fontes-pagadoras/ativas');
    return response.data;
  },

  // Buscar fonte por ID
  getById: async (id: string): Promise<FontePagadora> => {
    const response = await api.get(`/fontes-pagadoras/${id}`);
    return response.data;
  },

  // Criar fonte pagadora
  create: async (data: CreateFontePagadoraDto): Promise<FontePagadora> => {
    const response = await api.post('/fontes-pagadoras', data);
    return response.data;
  },

  // Atualizar fonte pagadora
  update: async ({ id, data }: { id: string; data: Partial<CreateFontePagadoraDto> }): Promise<FontePagadora> => {
    const response = await api.patch(`/fontes-pagadoras/${id}`, data);
    return response.data;
  },

  // Desativar fonte pagadora (soft delete)
  remove: async (id: string): Promise<FontePagadora> => {
    const response = await api.delete(`/fontes-pagadoras/${id}`);
    return response.data;
  },
};

// Hooks
export const useFontes = () => {
  return useQuery({
    queryKey: FONTES_KEYS.list(),
    queryFn: fontesAPI.list,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

export const useFontesAtivas = () => {
  return useQuery({
    queryKey: FONTES_KEYS.ativas(),
    queryFn: fontesAPI.listAtivas,
    staleTime: 10 * 60 * 1000,
  });
};

export const useFonte = (id: string) => {
  return useQuery({
    queryKey: FONTES_KEYS.detail(id),
    queryFn: () => fontesAPI.getById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
};

// Mutations
export const useCreateFonte = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: fontesAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FONTES_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: FONTES_KEYS.ativas() });
      toast.success('Fonte pagadora criada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar fonte pagadora');
    },
  });
};

export const useUpdateFonte = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: fontesAPI.update,
    onSuccess: (data) => {
      // Optimistic update
      queryClient.setQueryData(FONTES_KEYS.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: FONTES_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: FONTES_KEYS.ativas() });
      toast.success('Fonte pagadora atualizada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar fonte pagadora');
    },
  });
};

export const useRemoveFonte = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: fontesAPI.remove,
    onSuccess: (data) => {
      // Optimistic update
      queryClient.setQueryData(FONTES_KEYS.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: FONTES_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: FONTES_KEYS.ativas() });
      toast.success('Fonte pagadora desativada!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao desativar fonte pagadora');
    },
  });
};
