import { db } from '../db/client';
import { syncOutbox, patientsLocal, appointmentsLocal } from '../db/schema';
import { api } from '../services/api';
import { eq, and, isNull, lt } from 'drizzle-orm';

interface PushResult {
  success: boolean;
  processedCount: number;
  error?: string;
}

// Função para calcular backoff exponencial
function calculateBackoff(retryCount: number): number {
  const baseDelay = 1000; // 1 segundo
  const maxDelay = 30000; // 30 segundos
  const delay = Math.min(baseDelay * Math.pow(2, retryCount), maxDelay);
  return delay + Math.random() * 1000; // Adicionar jitter
}

// Função para processar um item do outbox
async function processOutboxItem(item: any): Promise<boolean> {
  try {
    const payload = JSON.parse(item.payload);
    
    switch (item.entity) {
      case 'patient':
        return await processPatientSync(item.operation, payload, item.id);
      case 'appointment':
        return await processAppointmentSync(item.operation, payload, item.id);
      default:
        console.warn(`Unknown entity type: ${item.entity}`);
        return false;
    }
  } catch (error) {
    console.error(`Error processing outbox item ${item.id}:`, error);
    return false;
  }
}

// Processar sincronização de paciente
async function processPatientSync(operation: string, payload: any, outboxId: string): Promise<boolean> {
  try {
    let response;
    
    switch (operation) {
      case 'create':
        response = await api.post('/pacientes', payload);
        break;
      case 'update':
        response = await api.put(`/pacientes/${payload.idRemote}`, payload);
        break;
      case 'delete':
        response = await api.delete(`/pacientes/${payload.idRemote}`);
        break;
      default:
        console.warn(`Unknown operation: ${operation}`);
        return false;
    }

    if (response.status >= 200 && response.status < 300) {
      // Sucesso - atualizar registro local com id_remote
      if (operation === 'create' && response.data?.id) {
        await db.update(patientsLocal)
          .set({ idRemote: response.data.id })
          .where(eq(patientsLocal.idLocal, payload.idLocal));
      }
      
      // Remover do outbox
      await db.delete(syncOutbox).where(eq(syncOutbox.id, outboxId));
      return true;
    }
    
    return false;
  } catch (error: any) {
    console.error(`Error processing patient sync (${operation}):`, error);
    
    // Se for erro 409 (conflito), remover do outbox (server wins)
    if (error.response?.status === 409) {
      await db.delete(syncOutbox).where(eq(syncOutbox.id, outboxId));
      return true;
    }
    
    return false;
  }
}

// Processar sincronização de consulta
async function processAppointmentSync(operation: string, payload: any, outboxId: string): Promise<boolean> {
  try {
    let response;
    
    switch (operation) {
      case 'create':
        response = await api.post('/consultas', payload);
        break;
      case 'update':
        response = await api.put(`/consultas/${payload.idRemote}`, payload);
        break;
      case 'delete':
        response = await api.delete(`/consultas/${payload.idRemote}`);
        break;
      default:
        console.warn(`Unknown operation: ${operation}`);
        return false;
    }

    if (response.status >= 200 && response.status < 300) {
      // Sucesso - atualizar registro local com id_remote
      if (operation === 'create' && response.data?.id) {
        await db.update(appointmentsLocal)
          .set({ idRemote: response.data.id })
          .where(eq(appointmentsLocal.idLocal, payload.idLocal));
      }
      
      // Remover do outbox
      await db.delete(syncOutbox).where(eq(syncOutbox.id, outboxId));
      return true;
    }
    
    return false;
  } catch (error: any) {
    console.error(`Error processing appointment sync (${operation}):`, error);
    
    // Se for erro 409 (conflito), remover do outbox (server wins)
    if (error.response?.status === 409) {
      await db.delete(syncOutbox).where(eq(syncOutbox.id, outboxId));
      return true;
    }
    
    return false;
  }
}

// Função principal de push
export async function pushData(): Promise<PushResult> {
  try {
    console.log('Starting push sync...');
    
    // Buscar itens do outbox que não foram tentados recentemente
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60000).toISOString();
    
    const outboxItems = await db.select()
      .from(syncOutbox)
      .where(
        and(
          isNull(syncOutbox.lastTryAt),
          lt(syncOutbox.lastTryAt, oneMinuteAgo)
        )
      )
      .orderBy(syncOutbox.createdAt);

    let processedCount = 0;
    let successCount = 0;

    for (const item of outboxItems) {
      try {
        // Atualizar lastTryAt
        await db.update(syncOutbox)
          .set({ 
            lastTryAt: new Date().toISOString(),
            retryCount: item.retryCount + 1,
          })
          .where(eq(syncOutbox.id, item.id));

        // Processar item
        const success = await processOutboxItem(item);
        
        if (success) {
          successCount++;
        } else {
          // Se falhou e já tentou muitas vezes, remover do outbox
          if (item.retryCount >= 5) {
            await db.delete(syncOutbox).where(eq(syncOutbox.id, item.id));
            console.warn(`Removing outbox item ${item.id} after 5 retries`);
          }
        }
        
        processedCount++;
        
        // Pequena pausa entre requisições
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`Error processing outbox item ${item.id}:`, error);
        processedCount++;
      }
    }

    console.log(`Push sync completed: ${successCount}/${processedCount} items processed successfully`);
    
    return {
      success: true,
      processedCount: successCount,
    };
  } catch (error: any) {
    console.error('Push sync failed:', error);
    return {
      success: false,
      processedCount: 0,
      error: error.message || 'Erro na sincronização',
    };
  }
}

// Função para adicionar item ao outbox
export async function addToOutbox(
  entity: 'patient' | 'appointment',
  operation: 'create' | 'update' | 'delete',
  payload: any
): Promise<void> {
  try {
    await db.insert(syncOutbox).values({
      id: `outbox_${Date.now()}_${Math.random()}`,
      entity,
      operation,
      payload: JSON.stringify(payload),
      retryCount: 0,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error adding to outbox:', error);
    throw error;
  }
}

// Função para obter estatísticas do outbox
export async function getOutboxStats(): Promise<{
  total: number;
  byEntity: Record<string, number>;
  byOperation: Record<string, number>;
}> {
  try {
    const items = await db.select().from(syncOutbox);
    
    const byEntity: Record<string, number> = {};
    const byOperation: Record<string, number> = {};
    
    items.forEach((item: any) => {
      byEntity[item.entity] = (byEntity[item.entity] || 0) + 1;
      byOperation[item.operation] = (byOperation[item.operation] || 0) + 1;
    });
    
    return {
      total: items.length,
      byEntity,
      byOperation,
    };
  } catch (error) {
    console.error('Error getting outbox stats:', error);
    return {
      total: 0,
      byEntity: {},
      byOperation: {},
    };
  }
}
