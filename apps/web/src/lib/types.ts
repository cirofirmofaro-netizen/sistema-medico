// Tipos alinhados ao backend do módulo de Plantões e Controle Financeiro/IR

export type TipoVinculo = 'CLT' | 'RPA' | 'PJ' | 'COOPERATIVA' | 'AUTONOMO';
export type Pagador = 'HOSPITAL' | 'PLANTONISTA';
export type StatusPlantao = 'AGENDADO' | 'REALIZADO' | 'CANCELADO' | 'TROCADO';
export type StatusPagamento = 'PENDENTE' | 'PARCIAL' | 'PAGO' | 'EM_ATRASO';
export type MeioPagamento = 'HOSPITAL' | 'PLANTONISTA';
export type StatusInforme = 'PENDENTE' | 'SOLICITADO' | 'RECEBIDO';

export interface FontePagadora {
  id: string;
  nome: string;
  cnpj: string;
  tipoVinculo: TipoVinculo;
  contatoEmail?: string;
  contatoFone?: string;
  inicio?: string;
  fim?: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ModeloPlantao {
  id: string;
  fontePagadoraId: string;
  fontePagadora?: FontePagadora;
  local: string;
  descricao?: string;
  inicioPadrao: string;
  fimPadrao: string;
  duracaoMin: number;
  valorPrevisto: number;
  tipoVinculo: TipoVinculo;
  pagador: Pagador;
  fixo: boolean;
  recorrencia?: {
    freq: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
    byWeekday?: number[];
    interval?: number;
  };
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Plantao {
  id: string;
  modeloId?: string;
  modelo?: ModeloPlantao;
  fontePagadoraId: string;
  fontePagadora?: FontePagadora;
  data: string;
  inicio: string;
  fim: string;
  local: string;
  cnpj: string;
  valorPrevisto: number;
  tipoVinculo: TipoVinculo;
  status: StatusPlantao;
  ehTroca: boolean;
  trocaCom?: string;
  motivoTroca?: string;
  reagendadoPara?: string;
  pagamentos?: Pagamento[];
  createdAt: string;
  updatedAt: string;
}

export interface Pagamento {
  id: string;
  plantaoId?: string;
  plantao?: Plantao;
  fontePagadoraId: string;
  fontePagadora?: FontePagadora;
  competencia: string;
  valorPrevisto: number;
  valorPago: number;
  dataPagamento?: string;
  status: StatusPagamento;
  meio: MeioPagamento;
  nfId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotaFiscal {
  id: string;
  pagamentoId: string;
  pagamento?: Pagamento;
  numero: string;
  serie?: string;
  dataEmissao: string;
  valor: number;
  pdfKey?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InformeRendimento {
  id: string;
  anoRef: number;
  fontePagadoraId: string;
  fontePagadora?: FontePagadora;
  status: StatusInforme;
  pdfKey?: string;
  anotacoes?: string;
  createdAt: string;
  updatedAt: string;
}

// DTOs para criação/atualização
export interface CreateFontePagadoraDto {
  nome: string;
  cnpj: string;
  tipoVinculo: TipoVinculo;
  contatoEmail?: string;
  contatoFone?: string;
  inicio?: string;
  fim?: string;
}

export interface CreateModeloPlantaoDto {
  fontePagadoraId: string;
  local: string;
  descricao?: string;
  inicioPadrao: string;
  fimPadrao: string;
  duracaoMin: number;
  valorPrevisto: number;
  tipoVinculo: TipoVinculo;
  pagador: Pagador;
  fixo: boolean;
  recorrencia?: {
    freq: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
    byWeekday?: number[];
    interval?: number;
  };
  observacoes?: string;
}

export interface CreatePlantaoDto {
  modeloId?: string;
  fontePagadoraId: string;
  data: string;
  inicio: string;
  fim: string;
  local: string;
  cnpj: string;
  valorPrevisto: number;
  tipoVinculo: TipoVinculo;
}

export interface CreatePagamentoDto {
  plantaoId?: string;
  fontePagadoraId: string;
  competencia: string;
  valorPrevisto: number;
  valorPago: number;
  dataPagamento?: string;
  meio: MeioPagamento;
}

// Filtros e consultas
export interface PlantaoFilters {
  from?: string;
  to?: string;
  status?: StatusPlantao;
  fontePagadoraId?: string;
}

export interface PagamentoFilters {
  competencia?: string;
  status?: StatusPagamento;
  fontePagadoraId?: string;
}

// Resumos e estatísticas
export interface ResumoPlantoes {
  total: number;
  agendados: number;
  realizados: number;
  cancelados: number;
  trocados: number;
  valorTotalPrevisto: number;
  valorTotalRealizado: number;
  porFontePagadora: Record<string, {
    total: number;
    realizados: number;
    valorPrevisto: number;
    valorRealizado: number;
  }>;
}

export interface ResumoFinanceiro {
  totalRecebido: number;
  totalEmAberto: number;
  totalParcial: number;
  totalEmAtraso: number;
  porCompetencia: Record<string, {
    recebido: number;
    emAberto: number;
    parcial: number;
    emAtraso: number;
  }>;
}

// Checklist IR
export interface IRChecklistItem {
  id: string;
  nome: string;
  cnpj: string;
  tipoVinculo: TipoVinculo;
  ativo: boolean;
  status: StatusInforme;
  informe?: InformeRendimento;
}
