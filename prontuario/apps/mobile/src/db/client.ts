import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { patientsLocal, appointmentsLocal, syncOutbox, syncConfig } from './schema';

// Abrir conexão com SQLite
const sqlite = SQLite.openDatabaseSync('prontuario.db');

// Criar instância do Drizzle
export const db = drizzle(sqlite);

// Função para inicializar o banco (criar tabelas)
export async function initDatabase() {
  try {
    // Criar tabelas se não existirem
    await sqlite.execAsync(`
      CREATE TABLE IF NOT EXISTS patients_local (
        id_local TEXT PRIMARY KEY,
        id_remote TEXT,
        full_name TEXT NOT NULL,
        cpf TEXT,
        birth_date TEXT,
        sex TEXT,
        email TEXT,
        phone TEXT,
        notes TEXT,
        updated_at TEXT NOT NULL,
        deleted_at TEXT
      );

      CREATE TABLE IF NOT EXISTS appointments_local (
        id_local TEXT PRIMARY KEY,
        id_remote TEXT,
        patient_id_local TEXT NOT NULL,
        starts_at TEXT NOT NULL,
        ends_at TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'AGENDADA',
        location TEXT,
        notes TEXT,
        updated_at TEXT NOT NULL,
        deleted_at TEXT
      );

      CREATE TABLE IF NOT EXISTS sync_outbox (
        id TEXT PRIMARY KEY,
        entity TEXT NOT NULL,
        operation TEXT NOT NULL,
        payload TEXT NOT NULL,
        retry_count INTEGER NOT NULL DEFAULT 0,
        last_try_at TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS sync_config (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      -- Índices para performance
      CREATE INDEX IF NOT EXISTS idx_patients_remote ON patients_local(id_remote);
      CREATE INDEX IF NOT EXISTS idx_patients_updated ON patients_local(updated_at);
      CREATE INDEX IF NOT EXISTS idx_appointments_remote ON appointments_local(id_remote);
      CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments_local(patient_id_local);
      CREATE INDEX IF NOT EXISTS idx_appointments_starts ON appointments_local(starts_at);
      CREATE INDEX IF NOT EXISTS idx_sync_outbox_entity ON sync_outbox(entity);
      CREATE INDEX IF NOT EXISTS idx_sync_outbox_retry ON sync_outbox(retry_count);
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Função para limpar dados (útil para testes)
export async function clearDatabase() {
  try {
    await sqlite.execAsync(`
      DELETE FROM patients_local;
      DELETE FROM appointments_local;
      DELETE FROM sync_outbox;
      DELETE FROM sync_config;
    `);
    console.log('Database cleared successfully');
  } catch (error) {
    console.error('Error clearing database:', error);
    throw error;
  }
}
