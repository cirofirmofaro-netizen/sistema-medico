import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Tabela de pacientes locais
export const patientsLocal = sqliteTable('patients_local', {
  idLocal: text('id_local').primaryKey(),
  idRemote: text('id_remote'),
  fullName: text('full_name').notNull(),
  cpf: text('cpf'),
  birthDate: text('birth_date'), // ISO string
  sex: text('sex'),
  email: text('email'),
  phone: text('phone'),
  notes: text('notes'),
  updatedAt: text('updated_at').notNull(), // ISO string
  deletedAt: text('deleted_at'), // ISO string
});

// Tabela de consultas locais
export const appointmentsLocal = sqliteTable('appointments_local', {
  idLocal: text('id_local').primaryKey(),
  idRemote: text('id_remote'),
  patientIdLocal: text('patient_id_local').notNull(),
  startsAt: text('starts_at').notNull(), // ISO string
  endsAt: text('ends_at').notNull(), // ISO string
  type: text('type').notNull(), // 'PRESENCIAL' | 'TELE'
  status: text('status').notNull().default('AGENDADA'), // 'AGENDADA' | 'CONCLUIDA' | 'CANCELADA'
  location: text('location'),
  notes: text('notes'),
  updatedAt: text('updated_at').notNull(), // ISO string
  deletedAt: text('deleted_at'), // ISO string
});

// Tabela de sincronização (outbox)
export const syncOutbox = sqliteTable('sync_outbox', {
  id: text('id').primaryKey(),
  entity: text('entity').notNull(), // 'patient' | 'appointment'
  operation: text('operation').notNull(), // 'create' | 'update' | 'delete'
  payload: text('payload').notNull(), // JSON string
  retryCount: integer('retry_count').notNull().default(0),
  lastTryAt: text('last_try_at'), // ISO string
  createdAt: text('created_at').notNull(), // ISO string
});

// Tabela de configurações de sincronização
export const syncConfig = sqliteTable('sync_config', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: text('updated_at').notNull(), // ISO string
});

// Tipos TypeScript
export type PatientLocal = typeof patientsLocal.$inferSelect;
export type PatientLocalInsert = typeof patientsLocal.$inferInsert;
export type AppointmentLocal = typeof appointmentsLocal.$inferSelect;
export type AppointmentLocalInsert = typeof appointmentsLocal.$inferInsert;
export type SyncOutbox = typeof syncOutbox.$inferSelect;
export type SyncOutboxInsert = typeof syncOutbox.$inferInsert;
