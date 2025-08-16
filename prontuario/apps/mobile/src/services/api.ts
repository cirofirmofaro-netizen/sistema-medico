import axios, { AxiosError, AxiosResponse } from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const ANDROID_EMULATOR = 'http://10.0.2.2:3000';
const IOS_SIMULATOR   = 'http://localhost:3000';
// Se for aparelho físico, troque pelo IP da sua máquina (mesma rede), ex: 'http://192.168.0.10:3000'
const DEVICE_LAN      = 'http://192.168.15.14:3000';

const baseURL = DEVICE_LAN;

export const api = axios.create({
  baseURL,
  timeout: 8000,
});

// Chaves para SecureStore
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token from SecureStore:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      try {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
        
        // Emitir evento de logout (pode ser usado pelo store de auth)
        // EventEmitter.emit('auth:logout');
      } catch (secureError) {
        console.error('Error clearing tokens:', secureError);
      }
    }
    return Promise.reject(error);
  }
);

// Funções para gerenciar tokens
export const authService = {
  async setTokens(token: string, refreshToken?: string) {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      if (refreshToken) {
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
      }
    } catch (error) {
      console.error('Error saving tokens:', error);
      throw error;
    }
  },

  async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  },

  async clearTokens() {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error clearing tokens:', error);
      throw error;
    }
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }
};

// Função para verificar conectividade
export const checkConnectivity = async (): Promise<boolean> => {
  try {
    const response = await api.get('/health', { timeout: 3000 });
    return response.status === 200;
  } catch (error) {
    return false;
  }
};
