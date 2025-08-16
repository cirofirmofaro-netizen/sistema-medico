import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';

export const plantoes = sqliteTable('plantoes', {
  id: text('id').primaryKey(),
  inicio: integer('inicio', { mode: 'timestamp' }),
  fim: integer('fim', { mode: 'timestamp' }),
  local: text('local').notNull(),
  contratante: text('contratante').notNull(),
  tipo: text('tipo').notNull(),
  valorBruto: real('valor_bruto').notNull(),
  valorLiquido: real('valor_liquido'),
  statusPgto: text('status_pgto').notNull().default('PENDENTE'),
  notas: text('notas'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(Date.now()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(Date.now()),
  syncStatus: text('sync_status').notNull().default('PENDING'), // PENDING, SYNCED, ERROR
});

export const pacientes = sqliteTable('pacientes', {
  id: text('id').primaryKey(),
  nome: text('nome').notNull(),
  dtNasc: integer('dt_nasc', { mode: 'timestamp' }),
  cpf: text('cpf'),
  telefone: text('telefone'),
  email: text('email'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(Date.now()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(Date.now()),
  syncStatus: text('sync_status').notNull().default('PENDING'),
});

export const consultas = sqliteTable('consultas', {
  id: text('id').primaryKey(),
  pacienteId: text('paciente_id').references(() => pacientes.id),
  tipo: text('tipo').notNull(), // PRESENCIAL, TELE
  inicio: integer('inicio', { mode: 'timestamp' }).notNull(),
  fim: integer('fim', { mode: 'timestamp' }).notNull(),
  status: text('status').notNull().default('AGENDADA'), // AGENDADA, CONCLUIDA, CANCELADA
  salaId: text('sala_id'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(Date.now()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(Date.now()),
  syncStatus: text('sync_status').notNull().default('PENDING'),
});

export const pagamentosPlantao = sqliteTable('pagamentos_plantao', {
  id: text('id').primaryKey(),
  plantaoId: text('plantao_id').notNull().references(() => plantoes.id),
  dtPrevista: integer('dt_prevista', { mode: 'timestamp' }),
  dtPgto: integer('dt_pgto', { mode: 'timestamp' }),
  valorPago: real('valor_pago').notNull(),
  comprovanteKey: text('comprovante_key'),
  obs: text('obs'),
  syncStatus: text('sync_status').notNull().default('PENDING'),
});

export const syncOutbox = sqliteTable('sync_outbox', {
  id: text('id').primaryKey(),
  table: text('table').notNull(), // nome da tabela
  recordId: text('record_id').notNull(), // id do registro
  operation: text('operation').notNull(), // CREATE, UPDATE, DELETE
  data: text('data').notNull(), // JSON dos dados
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(Date.now()),
  retryCount: integer('retry_count').notNull().default(0),
  lastError: text('last_error'),
});
