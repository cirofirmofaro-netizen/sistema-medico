import { z } from 'zod';

export const PacienteSchema = z.object({
  id: z.string().uuid().optional(),
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  dtNasc: z.coerce.date().optional(),
  cpf: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email().optional(),
});

export const ConsultaSchema = z.object({
  id: z.string().uuid().optional(),
  pacienteId: z.string().uuid().optional(),
  tipo: z.enum(['PRESENCIAL', 'TELE']),
  inicio: z.coerce.date(),
  fim: z.coerce.date(),
  status: z.enum(['AGENDADA', 'CONCLUIDA', 'CANCELADA']).default('AGENDADA'),
  salaId: z.string().optional(),
});

export const PlantaoSchema = z.object({
  id: z.string().uuid().optional(),
  inicio: z.coerce.date(),
  fim: z.coerce.date(),
  local: z.string().min(2, 'Local deve ter pelo menos 2 caracteres'),
  contratante: z.string().min(2, 'Contratante deve ter pelo menos 2 caracteres'),
  tipo: z.string().min(2, 'Tipo deve ter pelo menos 2 caracteres'),
  valorBruto: z.coerce.number().nonnegative('Valor bruto deve ser positivo'),
  valorLiquido: z.coerce.number().nonnegative().optional(),
  statusPgto: z.enum(['PENDENTE', 'PAGO', 'PARCIAL', 'ATRASADO']).default('PENDENTE'),
  notas: z.string().optional(),
});

export const PagamentoPlantaoSchema = z.object({
  id: z.string().uuid().optional(),
  plantaoId: z.string().uuid(),
  dtPrevista: z.coerce.date().optional(),
  dtPgto: z.coerce.date().optional(),
  valorPago: z.coerce.number().nonnegative('Valor pago deve ser positivo'),
  comprovanteKey: z.string().optional(),
  obs: z.string().optional(),
});

// Types
export type Paciente = z.infer<typeof PacienteSchema>;
export type Consulta = z.infer<typeof ConsultaSchema>;
export type Plantao = z.infer<typeof PlantaoSchema>;
export type PagamentoPlantao = z.infer<typeof PagamentoPlantaoSchema>;
