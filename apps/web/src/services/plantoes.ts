import api from '../lib/api'

export interface PagamentoPlantao {
  id: string
  plantaoId: string
  valorPago: number
  dtPgto: string
  formaPagamento: string
  obs?: string
  createdAt: string
}

export interface Plantao {
  id: string
  usuarioId: string | null
  inicio: string
  fim: string
  local: string
  contratante: string
  tipo: string
  valorBruto: number
  valorLiquido: number | null
  statusPgto: 'PENDENTE' | 'PARCIAL' | 'PAGO' | 'ATRASADO'
  notas: string | null
  createdAt: string
  updatedAt: string
}

export interface CreatePlantaoData {
  data: string
  horaInicio: string
  horaFim: string
  local: string
  especialidade: string
  valor: number
  observacoes?: string
}

export interface UpdatePlantaoData extends Partial<CreatePlantaoData> {
  id: string
  status?: Plantao['status']
}

export interface ListPlantoesParams {
  q?: string
  page?: number
  limit?: number
  mes?: number
  ano?: number
  status?: Plantao['status']
}

export interface ListPlantoesResponse {
  items: Plantao[]
  total: number
  page?: number
  totalPages?: number
}

export interface PlantaoStats {
  totalPlantoes: number
  horasTrabalhadas: number
  valorTotal: number
  plantoesRealizados: number
  plantoesPendentes: number
}

export const plantoesService = {
  async listPlantoes(params: ListPlantoesParams = {}): Promise<ListPlantoesResponse> {
    const { q = '', page = 1, limit = 10, mes, ano, status } = params
    
    const response = await api.get<ListPlantoesResponse>('/plantoes', {
      params: {
        q,
        page,
        limit,
        mes,
        ano,
        status,
      },
    })
    
    return response.data
  },

  async getPlantao(id: string): Promise<Plantao> {
    const response = await api.get<Plantao>(`/plantoes/${id}`)
    return response.data
  },

  async createPlantao(data: CreatePlantaoData): Promise<Plantao> {
    const response = await api.post<Plantao>('/plantoes', data)
    return response.data
  },

  async updatePlantao(data: UpdatePlantaoData): Promise<Plantao> {
    const { id, ...updateData } = data
    const response = await api.patch<Plantao>(`/plantoes/${id}`, updateData)
    return response.data
  },

  async deletePlantao(id: string): Promise<void> {
    await api.delete(`/plantoes/${id}`)
  },

  async getStats(mes?: number, ano?: number): Promise<PlantaoStats> {
    const response = await api.get<PlantaoStats>('/plantoes/stats', {
      params: { mes, ano }
    })
    return response.data
  },

  async confirmarPlantao(id: string): Promise<Plantao> {
    const response = await api.patch<Plantao>(`/plantoes/${id}/confirmar`)
    return response.data
  },

  async cancelarPlantao(id: string): Promise<Plantao> {
    const response = await api.patch<Plantao>(`/plantoes/${id}/cancelar`)
    return response.data
  },

  async realizarPlantao(id: string): Promise<Plantao> {
    const response = await api.patch<Plantao>(`/plantoes/${id}/realizar`)
    return response.data
  },

  async registrarPagamento(plantaoId: string, data: {
    valorPago: number
    dtPgto: string
    formaPagamento: string
    obs?: string
  }): Promise<any> {
    const response = await api.post(`/plantoes/${plantaoId}/pagamentos`, data)
    return response.data
  }
}
