// Re-exportar tipos dos serviços
export type { Paciente, CreatePacienteData, UpdatePacienteData } from './services/pacientes'
export type { User, LoginData, LoginResponse } from './services/auth'
export type { 
  Plantao, 
  CreatePlantaoData, 
  UpdatePlantaoData, 
  ListPlantoesParams, 
  ListPlantoesResponse,
  PlantaoStats 
} from './services/plantoes'
export type { 
  NotificationPreferences, 
  NotificationData 
} from './services/notifications'

// Tipos do módulo Pacientes/Prontuário
export interface Patient {
  id: string
  nome: string
  dataNascimento: string | null
  sexo: 'M' | 'F' | null
  cpf: string | null
  telefone: string | null
  email: string | null
  endereco: string | null
  observacoes: string | null
  createdAt: string
  updatedAt: string
}

export interface CreatePatientData {
  nome: string
  dataNascimento?: string
  sexo?: 'M' | 'F'
  cpf?: string
  telefone?: string
  email?: string
  endereco?: string
  observacoes?: string
}

export interface UpdatePatientData extends Partial<CreatePatientData> {
  id: string
}

export interface Appointment {
  id: string
  patientId: string
  patientName: string
  data: string
  horaInicio: string
  horaFim: string
  tipo: 'PRESENCIAL' | 'TELEMEDICINA'
  local: string
  observacoes: string | null
  status: 'AGENDADA' | 'CONFIRMADA' | 'CONCLUIDA' | 'CANCELADA'
  createdAt: string
  updatedAt: string
}

export interface CreateAppointmentData {
  patientId: string
  data: string
  horaInicio: string
  horaFim: string
  tipo: 'PRESENCIAL' | 'TELEMEDICINA'
  local: string
  observacoes?: string
}

export interface UpdateAppointmentData extends Partial<CreateAppointmentData> {
  id: string
  status?: Appointment['status']
}

export interface Evolution {
  id: string
  atendimentoId: string
  authorId: string
  resumo?: string
  texto: string
  registradoEm: string
  locked: boolean
  currentVersion: number
  author?: {
    id: string
    nome: string
  }
}

export interface CreateEvolutionData {
  patientId: string
  texto: string
  resumo?: string
  when?: string
}

export interface UpdateEvolutionData {
  id: string
  texto: string
  resumo?: string
}

export interface VitalSigns {
  id: string
  atendimentoId: string
  registradoEm: string
  pressaoSistolica: number
  pressaoDiastolica: number
  frequenciaCardiaca: number
  frequenciaRespiratoria: number
  saturacaoOxigenio: number
  temperatura: number
  peso?: number
  altura?: number
  observacoes?: string
  locked?: boolean
}

export interface CreateVitalSignsData {
  patientId: string
  pressaoSistolica: number
  pressaoDiastolica: number
  frequenciaCardiaca: number
  frequenciaRespiratoria: number
  saturacaoOxigenio: number
  temperatura: number
  peso?: number
  altura?: number
  observacoes?: string
  when?: string
}

export interface UpdateVitalSignsData {
  id: string
  pressaoSistolica?: number
  pressaoDiastolica?: number
  frequenciaCardiaca?: number
  frequenciaRespiratoria?: number
  saturacaoOxigenio?: number
  temperatura?: number
  peso?: number
  altura?: number
  observacoes?: string
}

export interface FileMeta {
  id: string
  atendimentoId: string
  filename: string
  mimeType: string
  size: number
  storageKey: string
  urlPublica?: string
  titulo?: string
  tipoDocumento?: string
  createdAt: string
  
  // Campos de retenção conforme Lei 13.787/2018
  retainedUntil?: string
  legalHold?: boolean
  deletedAt?: string
  retentionReason?: string
  lastPatientActivity?: string
}

export interface UploadFileData {
  patientId: string
  file: File
  titulo?: string
  tipoDocumento?: string
}

export interface FileService {
  listFiles(patientId: string): Promise<FileMeta[]>
  uploadFile(data: UploadFileData): Promise<FileMeta>
  deleteFile(patientId: string, fileId: string): Promise<void>
  downloadFile(patientId: string, fileId: string): Promise<string>
}

// Enums
export type AppointmentType = 'PRESENCIAL' | 'TELEMEDICINA'
export type AppointmentStatus = 'AGENDADA' | 'CONFIRMADA' | 'CONCLUIDA' | 'CANCELADA'
export type PatientGender = 'M' | 'F'

// Tipos adicionais que podem ser necessários
export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  totalPages: number
}

export interface PatientCondition {
  id: string
  patientId: string
  conditionId: string
  condition: {
    id: string
    name: string
    icd10?: string
    flags: {
      chronicDefault: boolean
      treatableDefault: boolean
      allowRecurrence: boolean
      typicalDurationDays?: number
    }
    synonyms: string[]
  }
  source: 'PRE_EXISTING' | 'DIAGNOSED'
  status: 'ACTIVE' | 'RESOLVED' | 'INACTIVE'
  onsetDate?: string
  resolutionDate?: string
  chronicOverride?: boolean
  treatableOverride?: boolean
  severity?: string
  notes?: string
  appointmentId?: string
  lastReviewedAt?: string
  isChronic: boolean
  isTreatable: boolean
  occurrences: ConditionOccurrence[]
  createdAt: string
  updatedAt: string
  locked?: boolean
}

export interface ConditionOccurrence {
  id: string
  patientConditionId: string
  startAt: string
  endAt?: string
  notes?: string
}

export interface PatientMedication {
  id: string
  patientId: string
  name: string
  dose?: string
  frequency?: string
  route?: string
  startDate?: string
  endDate?: string
  notes?: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface CreatePatientMedicationData {
  patientId: string
  name: string
  dose?: string
  frequency?: string
  route?: string
  startDate?: string
  endDate?: string
  notes?: string
}

export interface UpdatePatientMedicationData extends Partial<CreatePatientMedicationData> {
  id: string
  active?: boolean
}

// ===== MÓDULO DE PLANTÕES E CONTROLE FINANCEIRO/IR =====

// Enums
export enum TipoVinculo {
  CLT = 'CLT',
  RPA = 'RPA',
  PJ = 'PJ',
  COOPERATIVA = 'COOPERATIVA',
  AUTONOMO = 'AUTONOMO'
}

export enum Pagador {
  HOSPITAL = 'HOSPITAL',
  PLANTONISTA = 'PLANTONISTA'
}

export enum StatusPlantao {
  AGENDADO = 'AGENDADO',
  REALIZADO = 'REALIZADO',
  CANCELADO = 'CANCELADO',
  TROCADO = 'TROCADO'
}

export enum StatusPagamento {
  PENDENTE = 'PENDENTE',
  PARCIAL = 'PARCIAL',
  PAGO = 'PAGO',
  EM_ATRASO = 'EM_ATRASO'
}

export enum MeioPagamento {
  HOSPITAL = 'HOSPITAL',
  PLANTONISTA = 'PLANTONISTA'
}

export enum StatusInforme {
  PENDENTE = 'PENDENTE',
  SOLICITADO = 'SOLICITADO',
  RECEBIDO = 'RECEBIDO'
}

// Interfaces principais
export interface FontePagadora {
  id: string
  nome: string
  cnpj: string
  tipoVinculo: TipoVinculo
  contatoEmail?: string
  contatoFone?: string
  inicio: string
  fim?: string
  ativo: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateFontePagadoraData {
  nome: string
  cnpj: string
  tipoVinculo: TipoVinculo
  contatoEmail?: string
  contatoFone?: string
  inicio?: string
  fim?: string
}

export interface UpdateFontePagadoraData extends Partial<CreateFontePagadoraData> {
  id: string
  ativo?: boolean
}

export interface ModeloPlantao {
  id: string
  fontePagadoraId: string
  fontePagadora: FontePagadora
  local: string
  descricao?: string
  inicioPadrao: string
  fimPadrao: string
  duracaoMin: number
  valorPrevisto: number
  tipoVinculo: TipoVinculo
  pagador: Pagador
  fixo: boolean
  recorrencia?: any
  observacoes?: string
  createdAt: string
  updatedAt: string
}

export interface CreateModeloPlantaoData {
  fontePagadoraId: string
  local: string
  descricao?: string
  inicioPadrao: string
  fimPadrao: string
  duracaoMin: number
  valorPrevisto: number
  tipoVinculo: TipoVinculo
  pagador: Pagador
  fixo?: boolean
  recorrencia?: any
  observacoes?: string
}

export interface UpdateModeloPlantaoData extends Partial<CreateModeloPlantaoData> {
  id: string
}

export interface Plantao {
  id: string
  modeloId?: string
  modelo?: ModeloPlantao
  fontePagadoraId: string
  fontePagadora: FontePagadora
  data: string
  inicio: string
  fim: string
  local: string
  cnpj: string
  valorPrevisto: number
  tipoVinculo: TipoVinculo
  status: StatusPlantao
  ehTroca: boolean
  trocaCom?: string
  motivoTroca?: string
  reagendadoPara?: string
  createdAt: string
  updatedAt: string
  pagamentos: Pagamento[]
  notasFiscais: NotaFiscal[]
}

export interface CreatePlantaoAvulsoData {
  fontePagadoraId: string
  data: string
  inicio: string
  fim: string
  local: string
  cnpj: string
  valorPrevisto: number
  tipoVinculo: TipoVinculo
}

export interface Pagamento {
  id: string
  plantaoId?: string
  plantao?: Plantao
  fontePagadoraId: string
  fontePagadora: FontePagadora
  competencia: string
  valorPrevisto: number
  valorPago: number
  dataPagamento?: string
  status: StatusPagamento
  meio: MeioPagamento
  nfId?: string
  notaFiscal?: NotaFiscal
  createdAt: string
  updatedAt: string
}

export interface CreatePagamentoData {
  plantaoId?: string
  fontePagadoraId: string
  competencia: string
  valorPrevisto: number
  valorPago: number
  dataPagamento?: string
  meio: MeioPagamento
  nfId?: string
}

export interface UpdatePagamentoData extends Partial<CreatePagamentoData> {
  id: string
  status?: StatusPagamento
}

export interface NotaFiscal {
  id: string
  plantaoId?: string
  plantao?: Plantao
  fontePagadoraId?: string
  fontePagadora?: FontePagadora
  numero: string
  serie?: string
  valor: number
  dataEmissao: string
  pdfKey?: string
  createdAt: string
  updatedAt: string
  pagamentos: Pagamento[]
}

export interface CreateNotaFiscalData {
  plantaoId?: string
  fontePagadoraId?: string
  numero: string
  serie?: string
  valor: number
  dataEmissao: string
  pdfKey?: string
}

export interface UpdateNotaFiscalData extends Partial<CreateNotaFiscalData> {
  id: string
}

export interface InformeRendimento {
  id: string
  anoRef: number
  fontePagadoraId: string
  fontePagadora: FontePagadora
  status: StatusInforme
  pdfKey?: string
  anotacoes?: string
  createdAt: string
  updatedAt: string
}

export interface CreateInformeRendimentoData {
  anoRef: number
  fontePagadoraId: string
  anotacoes?: string
}

export interface UpdateInformeRendimentoData extends Partial<CreateInformeRendimentoData> {
  id: string
  status?: StatusInforme
  pdfKey?: string
}

// DTOs e tipos de filtro
export interface PlantaoFilters {
  dataInicio?: string
  dataFim?: string
  status?: StatusPlantao
  fontePagadoraId?: string
  cnpj?: string
  search?: string
}

export interface PagamentoFilters {
  competencia?: string
  status?: StatusPagamento
  fontePagadoraId?: string
  dataPagamentoInicio?: string
  dataPagamentoFim?: string
  search?: string
}

export interface GerarOcorrenciasData {
  modeloId: string
  dataInicio: string
  dataFim: string
}

export interface TrocaPlantaoData {
  plantaoId: string
  trocaCom: string
  motivoTroca: string
  reagendadoPara: string
}

export interface UploadInformeData {
  informeId: string
  file: File
}

export interface SolicitarInformeData {
  anoRef: number
  fontePagadoraId: string
}

// Tipos de resposta
export interface ResumoPlantoes {
  total: number
  agendados: number
  realizados: number
  cancelados: number
  trocados: number
  valorTotal: number
  valorPago: number
  valorPendente: number
}

export interface GerarOcorrenciasResponse {
  gerados: number
  plantoes: Plantao[]
}
