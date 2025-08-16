import api from '../lib/api'
import { Patient, CreatePatientData, UpdatePatientData } from '../types'

// Re-exportar tipos para compatibilidade
export type { Patient, CreatePatientData, UpdatePatientData }

export interface ListPatientsParams {
  q?: string
  page?: number
  limit?: number
}

export interface ListPatientsResponse {
  pacientes: Patient[]
  total: number
  page: number
  totalPages: number
}

export const patientsService = {
  async listPatients(params: ListPatientsParams = {}): Promise<ListPatientsResponse> {
    const { q = '', page = 1, limit = 10 } = params

    const response = await api.get<ListPatientsResponse>('/pacientes', {
      params: {
        search: q,
        page,
        limit,
      },
    })

    return response.data
  },

  async getPatient(id: string): Promise<Patient> {
    const response = await api.get<Patient>(`/pacientes/${id}`)
    return response.data
  },

  async createPatient(data: CreatePatientData): Promise<Patient> {
    const response = await api.post<Patient>('/pacientes', data)
    return response.data
  },

  async updatePatient(data: UpdatePatientData): Promise<Patient> {
    const { id, ...updateData } = data
    const response = await api.put<Patient>(`/pacientes/${id}`, updateData)
    return response.data
  },

  async deletePatient(id: string): Promise<void> {
    await api.delete(`/pacientes/${id}`)
  }
}
