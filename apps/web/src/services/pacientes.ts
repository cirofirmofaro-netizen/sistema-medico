import api from '../lib/api'

export interface Paciente {
  id: string
  nome: string
  dtNasc: string | null
  sexo: string | null
  cpf: string | null
  telefone: string | null
  email: string | null
  endereco: string | null
  createdAt: string
  updatedAt: string
}

export interface CreatePacienteData {
  nome: string
  dtNasc?: string
  sexo?: string
  cpf?: string
  telefone?: string
  email?: string
  endereco?: string
}

export interface UpdatePacienteData extends Partial<CreatePacienteData> {
  id: string
}

export interface ListPacientesParams {
  q?: string
  page?: number
  limit?: number
}

export interface ListPacientesResponse {
  pacientes: Paciente[]
  total: number
  page: number
  totalPages: number
}

export const pacientesService = {
  async listPacientes(params: ListPacientesParams = {}): Promise<ListPacientesResponse> {
    const { q = '', page = 1, limit = 10 } = params
    
    const response = await api.get<ListPacientesResponse>('/pacientes', {
      params: {
        search: q, // Mudando de 'q' para 'search' para corresponder à API
        page,
        limit,
      },
    })
    
    return response.data
  },

  async getPaciente(id: string): Promise<Paciente> {
    const response = await api.get<Paciente>(`/pacientes/${id}`)
    return response.data
  },

  async createPaciente(data: CreatePacienteData): Promise<Paciente> {
    const response = await api.post<Paciente>('/pacientes', data)
    return response.data
  },

  async updatePaciente(data: UpdatePacienteData): Promise<Paciente> {
    const { id, ...updateData } = data
    const response = await api.put<Paciente>(`/pacientes/${id}`, updateData)
    return response.data
  },

  async deletePaciente(id: string): Promise<void> {
    await api.delete(`/pacientes/${id}`)
  }
}
