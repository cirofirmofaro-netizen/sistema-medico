import { z } from 'zod';

// Validador para CNPJ
const cnpjSchema = z
  .string()
  .min(14, 'CNPJ deve ter 14 dígitos')
  .max(18, 'CNPJ muito longo')
  .refine((value) => {
    const clean = value.replace(/\D/g, '');
    return clean.length === 14;
  }, 'CNPJ inválido');

// Validador para competência (AAAA-MM)
const competenciaSchema = z
  .string()
  .regex(/^\d{4}-\d{2}$/, 'Formato deve ser AAAA-MM')
  .refine((value) => {
    const [ano, mes] = value.split('-');
    const anoNum = parseInt(ano);
    const mesNum = parseInt(mes);
    return anoNum >= 2020 && anoNum <= 2030 && mesNum >= 1 && mesNum <= 12;
  }, 'Competência inválida');

// Validador para horário (HH:mm)
const timeSchema = z
  .string()
  .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato deve ser HH:mm');

// Validador para data
const dateSchema = z
  .string()
  .refine((value) => {
    const date = new Date(value);
    return !isNaN(date.getTime());
  }, 'Data inválida');

// Schema para Fonte Pagadora
export const fontePagadoraSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  cnpj: cnpjSchema,
  tipoVinculo: z.enum(['CLT', 'RPA', 'PJ', 'COOPERATIVA', 'AUTONOMO']),
  contatoEmail: z.string().email('Email inválido').optional().or(z.literal('')),
  contatoFone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos').optional().or(z.literal('')),
  inicio: dateSchema.optional(),
  fim: dateSchema.optional(),
});

// Schema para Modelo de Plantão
export const modeloPlantaoSchema = z.object({
  fontePagadoraId: z.string().min(1, 'Fonte pagadora é obrigatória'),
  local: z.string().min(2, 'Local deve ter pelo menos 2 caracteres'),
  descricao: z.string().optional(),
  inicioPadrao: timeSchema,
  fimPadrao: timeSchema,
  duracaoMin: z.number().min(30, 'Duração mínima de 30 minutos').max(1440, 'Duração máxima de 24 horas'),
  valorPrevisto: z.number().min(0, 'Valor deve ser positivo'),
  tipoVinculo: z.enum(['CLT', 'RPA', 'PJ', 'COOPERATIVA', 'AUTONOMO']),
  pagador: z.enum(['HOSPITAL', 'PLANTONISTA']),
  fixo: z.boolean(),
  recorrencia: z.object({
    freq: z.enum(['WEEKLY', 'BIWEEKLY', 'MONTHLY']),
    byWeekday: z.array(z.number().min(0).max(6)).optional(),
    interval: z.number().min(1).default(1),
  }).optional(),
  observacoes: z.string().optional(),
}).refine((data) => {
  // Validar que fim > início (permitindo atravessar meia-noite)
  const [inicioHora, inicioMin] = data.inicioPadrao.split(':').map(Number);
  const [fimHora, fimMin] = data.fimPadrao.split(':').map(Number);
  
  // Converter para minutos desde meia-noite
  const inicioMinutos = inicioHora * 60 + inicioMin;
  const fimMinutos = fimHora * 60 + fimMin;
  
  // Se fim < início, significa que atravessa meia-noite (válido)
  // Se fim = início, significa duração zero (inválido)
  return fimMinutos !== inicioMinutos;
}, {
  message: 'Horário de fim não pode ser igual ao de início',
  path: ['fimPadrao'],
});

// Schema para Plantão Avulso
export const plantaoAvulsoSchema = z.object({
  fontePagadoraId: z.string().min(1, 'Fonte pagadora é obrigatória'),
  data: dateSchema,
  inicio: z.string().min(1, 'Horário de início é obrigatório'),
  fim: z.string().min(1, 'Horário de fim é obrigatório'),
  local: z.string().min(2, 'Local deve ter pelo menos 2 caracteres'),
  cnpj: cnpjSchema,
  valorPrevisto: z.number().min(0, 'Valor deve ser positivo'),
  tipoVinculo: z.enum(['CLT', 'RPA', 'PJ', 'COOPERATIVA', 'AUTONOMO']),
}).refine((data) => {
  // Validar que fim > início (permitindo atravessar meia-noite)
  const [inicioHora, inicioMin] = data.inicio.split(':').map(Number);
  const [fimHora, fimMin] = data.fim.split(':').map(Number);
  
  // Converter para minutos desde meia-noite
  const inicioMinutos = inicioHora * 60 + inicioMin;
  const fimMinutos = fimHora * 60 + fimMin;
  
  // Se fim < início, significa que atravessa meia-noite (válido)
  // Se fim = início, significa duração zero (inválido)
  return fimMinutos !== inicioMinutos;
}, {
  message: 'Horário de fim não pode ser igual ao de início',
  path: ['fim'],
});

// Schema para Pagamento
export const pagamentoSchema = z.object({
  plantaoId: z.string().optional(),
  fontePagadoraId: z.string().min(1, 'Fonte pagadora é obrigatória'),
  competencia: competenciaSchema,
  valorPrevisto: z.number().min(0, 'Valor previsto deve ser positivo'),
  valorPago: z.number().min(0.01, 'Valor pago deve ser maior que zero'),
  dataPagamento: dateSchema.optional(),
  meio: z.enum(['HOSPITAL', 'PLANTONISTA']),
}).refine((data) => {
  // Validar que valor pago não excede o previsto (com tolerância de 10%)
  const tolerancia = data.valorPrevisto * 0.1;
  return data.valorPago <= data.valorPrevisto + tolerancia;
}, {
  message: 'Valor pago não pode exceder o valor previsto em mais de 10%',
  path: ['valorPago'],
});

// Schema para Troca de Plantão
export const trocaPlantaoSchema = z.object({
  trocaCom: z.string().min(1, 'Nome do colega é obrigatório'),
  motivo: z.string().min(10, 'Motivo deve ter pelo menos 10 caracteres'),
  reagendadoPara: dateSchema.optional(),
});

// Schema para Geração de Ocorrências
export const gerarOcorrenciasSchema = z.object({
  start: dateSchema,
  end: dateSchema,
}).refine((data) => {
  const start = new Date(data.start);
  const end = new Date(data.end);
  return end >= start;
}, {
  message: 'Data final deve ser posterior ou igual à data inicial',
  path: ['end'],
});

// Schema para Upload de Informe IR
export const uploadInformeSchema = z.object({
  fontePagadoraId: z.string().min(1, 'Fonte pagadora é obrigatória'),
  anoRef: z.number().min(2020).max(2030),
  filename: z.string().min(1, 'Nome do arquivo é obrigatório'),
  contentType: z.string().refine((value) => value === 'application/pdf', 'Apenas arquivos PDF são aceitos'),
  size: z.number().max(50 * 1024 * 1024, 'Arquivo deve ter no máximo 50MB'),
});

// Schema para Solicitar Informe IR
export const solicitarInformeSchema = z.object({
  fontePagadoraId: z.string().min(1, 'Fonte pagadora é obrigatória'),
  anoRef: z.number().min(2020).max(2030),
});

// Schema para Filtros de Plantão
export const plantaoFiltersSchema = z.object({
  from: dateSchema.optional(),
  to: dateSchema.optional(),
  status: z.enum(['AGENDADO', 'REALIZADO', 'CANCELADO', 'TROCADO']).optional(),
  fontePagadoraId: z.string().optional(),
});

// Schema para Filtros de Pagamento
export const pagamentoFiltersSchema = z.object({
  competencia: competenciaSchema.optional(),
  status: z.enum(['PENDENTE', 'PARCIAL', 'PAGO', 'EM_ATRASO']).optional(),
  fontePagadoraId: z.string().optional(),
});

// Tipos derivados dos schemas
export type FontePagadoraFormData = z.infer<typeof fontePagadoraSchema>;
export type ModeloPlantaoFormData = z.infer<typeof modeloPlantaoSchema>;
export type PlantaoAvulsoFormData = z.infer<typeof plantaoAvulsoSchema>;
export type PagamentoFormData = z.infer<typeof pagamentoSchema>;
export type TrocaPlantaoFormData = z.infer<typeof trocaPlantaoSchema>;
export type GerarOcorrenciasFormData = z.infer<typeof gerarOcorrenciasSchema>;
export type UploadInformeFormData = z.infer<typeof uploadInformeSchema>;
export type SolicitarInformeFormData = z.infer<typeof solicitarInformeSchema>;
export type PlantaoFiltersFormData = z.infer<typeof plantaoFiltersSchema>;
export type PagamentoFiltersFormData = z.infer<typeof pagamentoFiltersSchema>;
