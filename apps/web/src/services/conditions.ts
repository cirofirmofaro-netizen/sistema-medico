import api from '../lib/api'

export interface Condition {
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

export interface PatientCondition {
  id: string
  conditionId: string
  condition: Condition
  source: 'PRE_EXISTING' | 'DIAGNOSED' | 'SELF_REPORTED'
  status: 'ACTIVE' | 'REMISSION' | 'RESOLVED' | 'RULED_OUT'
  onsetDate?: string
  resolutionDate?: string
  chronicOverride?: boolean
  treatableOverride?: boolean
  severity?: string
  notes?: string
  appointmentId?: string
  lastReviewedAt?: string
  locked?: boolean
  isChronic: boolean
  isTreatable: boolean
  occurrences: ConditionOccurrence[]
  createdAt: string
  updatedAt: string
}

export interface ConditionOccurrence {
  id: string
  patientConditionId: string
  startAt: string
  endAt?: string
  notes?: string
}

export interface CreatePatientConditionData {
  conditionId: string
  source: 'PRE_EXISTING' | 'DIAGNOSED' | 'SELF_REPORTED'
  status?: 'ACTIVE' | 'REMISSION' | 'RESOLVED' | 'RULED_OUT'
  onsetDate?: string
  resolutionDate?: string
  chronicOverride?: boolean
  treatableOverride?: boolean
  severity?: string
  notes?: string
  appointmentId?: string
}

export interface UpdatePatientConditionData {
  status?: 'ACTIVE' | 'REMISSION' | 'RESOLVED' | 'RULED_OUT'
  onsetDate?: string
  resolutionDate?: string
  chronicOverride?: boolean
  treatableOverride?: boolean
  severity?: string
  notes?: string
}

export interface CreateOccurrenceData {
  startAt: string
  endAt?: string
  notes?: string
}

export interface UpdateOccurrenceData {
  endAt?: string
  notes?: string
}

export const conditionsService = {
  async searchConditions(query: string): Promise<Condition[]> {
    const response = await api.get<Condition[]>('/conditions/search', {
      params: { q: query }
    })
    return response.data
  },

  async getPatientConditions(patientId: string): Promise<PatientCondition[]> {
    const response = await api.get<PatientCondition[]>(`/conditions/patients/${patientId}/conditions`)
    return response.data
  },

  async createPatientCondition(patientId: string, data: CreatePatientConditionData): Promise<PatientCondition> {
    const response = await api.post<PatientCondition>(`/conditions/patients/${patientId}/conditions`, data)
    return response.data
  },

  async updatePatientCondition(patientId: string, pcId: string, data: UpdatePatientConditionData): Promise<PatientCondition> {
    const response = await api.put<PatientCondition>(`/conditions/patients/${patientId}/conditions/${pcId}`, data)
    return response.data
  },

  async createOccurrence(patientId: string, pcId: string, data: CreateOccurrenceData): Promise<ConditionOccurrence> {
    const response = await api.post<ConditionOccurrence>(`/conditions/patients/${patientId}/conditions/${pcId}/occurrences`, data)
    return response.data
  },

  async updateOccurrence(patientId: string, pcId: string, occId: string, data: UpdateOccurrenceData): Promise<ConditionOccurrence> {
    const response = await api.put<ConditionOccurrence>(`/conditions/patients/${patientId}/conditions/${pcId}/occurrences/${occId}`, data)
    return response.data
  }
}
