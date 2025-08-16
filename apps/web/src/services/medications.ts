import api from '../lib/api'

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

export interface CreateMedicationData {
  name: string
  dose?: string
  frequency?: string
  route?: string
  startDate?: string
  endDate?: string
  notes?: string
  active?: boolean
}

export interface UpdateMedicationData {
  name?: string
  dose?: string
  frequency?: string
  route?: string
  startDate?: string
  endDate?: string
  notes?: string
  active?: boolean
}

export const medicationsService = {
  async getPatientMedications(patientId: string): Promise<PatientMedication[]> {
    const response = await api.get<PatientMedication[]>(`/medications/patients/${patientId}/medications`)
    return response.data
  },

  async createMedication(patientId: string, data: CreateMedicationData): Promise<PatientMedication> {
    const response = await api.post<PatientMedication>(`/medications/patients/${patientId}/medications`, data)
    return response.data
  },

  async updateMedication(patientId: string, medId: string, data: UpdateMedicationData): Promise<PatientMedication> {
    const response = await api.put<PatientMedication>(`/medications/patients/${patientId}/medications/${medId}`, data)
    return response.data
  }
}
