import React from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { pullData } from './pull';
import { pushData } from './push';
import { useAuthStore } from '../stores/authStore';
import { checkConnectivity } from '../services/api';

interface SyncSchedule {
  isRunning: boolean;
  lastSyncAt: string | null;
  error: string | null;
}

class SyncScheduler {
  private isRunning = false;
  private lastSyncAt: string | null = null;
  private error: string | null = null;
  private listeners: ((schedule: SyncSchedule) => void)[] = [];

  constructor() {
    this.setupAppStateListener();
  }

  private setupAppStateListener() {
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  private handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      // App voltou ao foreground
      await this.syncIfNeeded();
    }
  }

  private notifyListeners() {
    const schedule: SyncSchedule = {
      isRunning: this.isRunning,
      lastSyncAt: this.lastSyncAt,
      error: this.error,
    };
    
    this.listeners.forEach(listener => listener(schedule));
  }

  public addListener(listener: (schedule: SyncSchedule) => void) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public async syncIfNeeded() {
    // Verificar se já está sincronizando
    if (this.isRunning) {
      return;
    }

    // Verificar conectividade
    const isOnline = await checkConnectivity();
    if (!isOnline) {
      console.log('No internet connection, skipping sync');
      return;
    }

    // Verificar se o usuário está autenticado
    const authStore = useAuthStore.getState();
    if (!authStore.isAuthenticated) {
      console.log('User not authenticated, skipping sync');
      return;
    }

    await this.performSync();
  }

  public async performSync() {
    if (this.isRunning) {
      console.log('Sync already running');
      return;
    }

    this.isRunning = true;
    this.error = null;
    this.notifyListeners();

    try {
      console.log('Starting scheduled sync...');
      
      // Primeiro fazer push (enviar dados locais)
      const pushResult = await pushData();
      if (!pushResult.success) {
        console.warn('Push sync failed:', pushResult.error);
      }

      // Depois fazer pull (baixar dados do servidor)
      const pullResult = await pullData();
      if (!pullResult.success) {
        console.warn('Pull sync failed:', pullResult.error);
        this.error = pullResult.error || 'Erro na sincronização';
      } else {
        // Atualizar timestamp da última sincronização
        this.lastSyncAt = new Date().toISOString();
        
        // Atualizar no store de auth
        const authStore = useAuthStore.getState();
        authStore.setLastSyncAt(this.lastSyncAt);
        
        console.log(`Sync completed successfully: ${pullResult.patientsCount} patients, ${pullResult.appointmentsCount} appointments`);
      }
    } catch (error: any) {
      console.error('Sync failed:', error);
      this.error = error.message || 'Erro na sincronização';
    } finally {
      this.isRunning = false;
      this.notifyListeners();
    }
  }

  public async forceSync() {
    console.log('Force sync requested');
    await this.performSync();
  }

  public getStatus(): SyncSchedule {
    return {
      isRunning: this.isRunning,
      lastSyncAt: this.lastSyncAt,
      error: this.error,
    };
  }

  public cleanup() {
    AppState.removeEventListener?.('change', this.handleAppStateChange);
    this.listeners = [];
  }
}

// Instância singleton
export const syncScheduler = new SyncScheduler();

// Hook para usar o scheduler
export function useSyncScheduler() {
  const [schedule, setSchedule] = React.useState<SyncSchedule>(syncScheduler.getStatus());

  React.useEffect(() => {
    const unsubscribe = syncScheduler.addListener(setSchedule);
    return unsubscribe;
  }, []);

  return {
    ...schedule,
    syncNow: () => syncScheduler.forceSync(),
  };
}

// Função para inicializar o scheduler
export function initSyncScheduler() {
  // Sincronizar quando o app iniciar
  setTimeout(() => {
    syncScheduler.syncIfNeeded();
  }, 2000); // Aguardar 2 segundos para o app carregar

  // Sincronizar a cada 5 minutos quando o app estiver ativo
  setInterval(() => {
    syncScheduler.syncIfNeeded();
  }, 5 * 60 * 1000);

  console.log('Sync scheduler initialized');
}
