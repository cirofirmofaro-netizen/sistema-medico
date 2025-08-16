import { db } from '../db/client';
import { patientsLocal, appointmentsLocal, syncConfig } from '../db/schema';
import { api } from '../services/api';
import { eq, and, isNull, gte, lte } from 'drizzle-orm';

interface SyncResult {
  success: boolean;
  patientsCount: number;
  appointmentsCount: number;
  error?: string;
}

// Função para obter timestamp da última sincronização
async function getLastSyncTimestamp(entity: string): Promise<string> {
  try {
    const result = await db.select().from(syncConfig).where(eq(syncConfig.key, `last_sync_${entity}`));
    return result[0]?.value || new Date(0).toISOString();
  } catch (error) {
    console.error(`Error getting last sync timestamp for ${entity}:`, error);
    return new Date(0).toISOString();
  }
}

// Função para salvar timestamp da última sincronização
async function setLastSyncTimestamp(entity: string, timestamp: string): Promise<void> {
  try {
    await db.insert(syncConfig).values({
      key: `last_sync_${entity}`,
      value: timestamp,
      updatedAt: new Date().toISOString(),
    }).onConflictDoUpdate({
      target: syncConfig.key,
      set: {
        value: timestamp,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error(`Error setting last sync timestamp for ${entity}:`, error);
  }
}

// Sincronizar pacientes
async function syncPatients(): Promise<number> {
  try {
    const lastSync = await getLastSyncTimestamp('patients');
    
    // Buscar pacientes do servidor
    const response = await api.get('/pacientes', {
      params: {
        updatedAfter: lastSync,
        limit: 1000, // Buscar todos os pacientes atualizados
      },
    });

    const patients = response.data.data || [];
    let count = 0;

    for (const patient of patients) {
      try {
        // Verificar se já existe localmente
        const existing = await db.select().from(patientsLocal).where(eq(patientsLocal.idRemote, patient.id));
        
        if (existing.length > 0) {
          // Atualizar paciente existente
          await db.update(patientsLocal)
            .set({
              fullName: patient.nome,
              cpf: patient.cpf,
              birthDate: patient.dtNasc ? new Date(patient.dtNasc).toISOString() : null,
              sex: patient.sexo,
              email: patient.email,
              phone: patient.telefone,
              notes: patient.notes,
              updatedAt: new Date(patient.updatedAt).toISOString(),
            })
            .where(eq(patientsLocal.idRemote, patient.id));
        } else {
          // Inserir novo paciente
          await db.insert(patientsLocal).values({
            idLocal: `local_${Date.now()}_${Math.random()}`,
            idRemote: patient.id,
            fullName: patient.nome,
            cpf: patient.cpf,
            birthDate: patient.dtNasc ? new Date(patient.dtNasc).toISOString() : null,
            sex: patient.sexo,
            email: patient.email,
            phone: patient.telefone,
            notes: patient.notes,
            updatedAt: new Date(patient.updatedAt).toISOString(),
          });
        }
        count++;
      } catch (error) {
        console.error(`Error syncing patient ${patient.id}:`, error);
      }
    }

    if (patients.length > 0) {
      await setLastSyncTimestamp('patients', new Date().toISOString());
    }

    return count;
  } catch (error) {
    console.error('Error syncing patients:', error);
    throw error;
  }
}

// Sincronizar consultas
async function syncAppointments(): Promise<number> {
  try {
    const lastSync = await getLastSyncTimestamp('appointments');
    
    // Buscar consultas do servidor (último mês)
    const now = new Date();
    const fromDate = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    const toDate = new Date(now.getFullYear(), now.getMonth() + 2, 0).toISOString();
    
    const response = await api.get('/consultas', {
      params: {
        from: fromDate,
        to: toDate,
        updatedAfter: lastSync,
        limit: 1000,
      },
    });

    const appointments = response.data.data || [];
    let count = 0;

    for (const appointment of appointments) {
      try {
        // Buscar paciente local correspondente
        const patient = await db.select().from(patientsLocal).where(eq(patientsLocal.idRemote, appointment.pacienteId));
        
        if (patient.length === 0) {
          console.warn(`Patient not found for appointment ${appointment.id}`);
          continue;
        }

        // Verificar se já existe localmente
        const existing = await db.select().from(appointmentsLocal).where(eq(appointmentsLocal.idRemote, appointment.id));
        
        if (existing.length > 0) {
          // Atualizar consulta existente
          await db.update(appointmentsLocal)
            .set({
              patientIdLocal: patient[0].idLocal,
              startsAt: new Date(appointment.inicio).toISOString(),
              endsAt: new Date(appointment.fim).toISOString(),
              type: appointment.tipo,
              status: appointment.status,
              location: appointment.location,
              notes: appointment.notes,
              updatedAt: new Date(appointment.updatedAt).toISOString(),
            })
            .where(eq(appointmentsLocal.idRemote, appointment.id));
        } else {
          // Inserir nova consulta
          await db.insert(appointmentsLocal).values({
            idLocal: `local_${Date.now()}_${Math.random()}`,
            idRemote: appointment.id,
            patientIdLocal: patient[0].idLocal,
            startsAt: new Date(appointment.inicio).toISOString(),
            endsAt: new Date(appointment.fim).toISOString(),
            type: appointment.tipo,
            status: appointment.status,
            location: appointment.location,
            notes: appointment.notes,
            updatedAt: new Date(appointment.updatedAt).toISOString(),
          });
        }
        count++;
      } catch (error) {
        console.error(`Error syncing appointment ${appointment.id}:`, error);
      }
    }

    if (appointments.length > 0) {
      await setLastSyncTimestamp('appointments', new Date().toISOString());
    }

    return count;
  } catch (error) {
    console.error('Error syncing appointments:', error);
    throw error;
  }
}

// Função principal de pull
export async function pullData(): Promise<SyncResult> {
  try {
    console.log('Starting pull sync...');
    
    const patientsCount = await syncPatients();
    const appointmentsCount = await syncAppointments();
    
    console.log(`Pull sync completed: ${patientsCount} patients, ${appointmentsCount} appointments`);
    
    return {
      success: true,
      patientsCount,
      appointmentsCount,
    };
  } catch (error: any) {
    console.error('Pull sync failed:', error);
    return {
      success: false,
      patientsCount: 0,
      appointmentsCount: 0,
      error: error.message || 'Erro na sincronização',
    };
  }
}
