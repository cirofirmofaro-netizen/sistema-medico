import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { api, authService } from '../services/api';

interface User {
  id: string;
  email: string;
  nome: string;
  crm?: string;
  especialidade?: string;
  role: 'ADMIN' | 'MEDICO' | 'ENFERMEIRO' | 'RECEPCIONISTA';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  lastSyncAt: string | null;
  
  // Actions
  login: (email: string, senha: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setLastSyncAt: (timestamp: string) => void;
}

// Storage customizado para SecureStore
const secureStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(name);
    } catch {
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(name, value);
    } catch {
      // Ignore errors
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(name);
    } catch {
      // Ignore errors
    }
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      lastSyncAt: null,

      login: async (email: string, senha: string) => {
        set({ isLoading: true });
        
        try {
          const response = await api.post('/auth/login', { email, senha });
          const { access_token, refresh_token, user } = response.data;

          // Salvar tokens
          await authService.setTokens(access_token, refresh_token);

          // Atualizar estado
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });

          return { success: true };
        } catch (error: any) {
          set({ isLoading: false });
          
          const errorMessage = error.response?.data?.message || 'Erro ao fazer login';
          return { success: false, error: errorMessage };
        }
      },

      logout: async () => {
        set({ isLoading: true });
        
        try {
          // Limpar tokens
          await authService.clearTokens();
          
          // Atualizar estado
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            lastSyncAt: null,
          });
        } catch (error) {
          console.error('Error during logout:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      checkAuth: async () => {
        set({ isLoading: true });
        
        try {
          const isAuth = await authService.isAuthenticated();
          
          if (isAuth) {
            // Verificar se o token ainda é válido fazendo uma requisição
            const response = await api.get('/auth/me');
            const user = response.data;
            
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } catch (error) {
          // Token inválido ou erro de rede
          await authService.clearTokens();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      setLastSyncAt: (timestamp: string) => {
        set({ lastSyncAt: timestamp });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        lastSyncAt: state.lastSyncAt,
      }),
    }
  )
);
