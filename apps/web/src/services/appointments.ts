import api from '../lib/api'
import { Appointment, CreateAppointmentData, UpdateAppointmentData } from '../types'

// Re-exportar tipos para compatibilidade
export type { Appointment, CreateAppointmentData, UpdateAppointmentData }

export interface ListAppointmentsParams {
  from?: string
  to?: string
  status?: string
  patientId?: string
  page?: number
  limit?: number
}

export interface ListAppointmentsResponse {
  appointments: Appointment[]
  total: number
  page: number
  totalPages: number
}

export const appointmentsService = {
  async listAppointments(params: ListAppointmentsParams = {}): Promise<ListAppointmentsResponse> {
    const { from, to, status, patientId, page = 1, limit = 50 } = params

    const response = await api.get<ListAppointmentsResponse>('/appointments', {
      params: {
        from,
        to,
        status,
        patientId,
        page,
        limit,
      },
    })

    return response.data
  },

  async getAppointment(id: string): Promise<Appointment> {
    const response = await api.get<Appointment>(`/appointments/${id}`)
    return response.data
  },

  async createAppointment(data: CreateAppointmentData): Promise<Appointment> {
    const response = await api.post<Appointment>('/appointments', data)
    return response.data
  },

  async updateAppointment(data: UpdateAppointmentData): Promise<Appointment> {
    const { id, ...updateData } = data
    const response = await api.put<Appointment>(`/appointments/${id}`, updateData)
    return response.data
  },

  async deleteAppointment(id: string): Promise<void> {
    await api.delete(`/appointments/${id}`)
  },

  async checkConflicts(data: CreateAppointmentData): Promise<{ hasConflict: boolean; conflictingAppointments: Appointment[] }> {
    const response = await api.post('/appointments/check-conflicts', data)
    return response.data
  }
}
