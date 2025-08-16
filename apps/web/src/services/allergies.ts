import api from '../lib/api';

export interface Allergen {
  id: string;
  name: string;
  canonical: string;
  category: 'DRUG' | 'FOOD' | 'ENVIRONMENT' | 'CONTACT' | 'OTHER';
  snomed?: string;
  synonyms: { value: string }[];
  crossRefsTo: { toId: string; relation: string }[];
}

export interface PatientAllergy {
  id: string;
  patientId: string;
  allergenId: string;
  status: 'ACTIVE' | 'INACTIVE';
  severity: 'MILD' | 'MODERATE' | 'SEVERE' | 'UNKNOWN';
  reactions?: string;
  onsetDate?: string;
  notes?: string;
  source: 'PATIENT' | 'REPORTED' | 'CLINICAL' | 'LAB';
  recordedBy?: string;
  recordedAt: string;
  lastUpdated: string;
  allergen: Allergen & {
    synonyms: { value: string }[];
  };
  recordedByUser?: {
    id: string;
    nome: string;
  };
}

export interface CreateAllergyData {
  allergenId: string;
  severity?: 'MILD' | 'MODERATE' | 'SEVERE' | 'UNKNOWN';
  reactions?: string;
  onsetDate?: string;
  notes?: string;
  source?: 'PATIENT' | 'REPORTED' | 'CLINICAL' | 'LAB';
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface UpdateAllergyData {
  severity?: 'MILD' | 'MODERATE' | 'SEVERE' | 'UNKNOWN';
  reactions?: string;
  onsetDate?: string;
  notes?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export const allergiesService = {
  // Buscar alergenos
  searchAllergens: async (query: string, take = 20) => {
    const response = await api.get<Allergen[]>(`/allergies/allergens/search?q=${encodeURIComponent(query)}&take=${take}`);
    return response.data;
  },

  // Listar alergias do paciente
  getPatientAllergies: async (patientId: string) => {
    const response = await api.get<PatientAllergy[]>(`/allergies/patients/${patientId}/allergies`);
    return response.data;
  },

  // Criar alergia
  createPatientAllergy: async (patientId: string, data: CreateAllergyData) => {
    const response = await api.post<PatientAllergy>(`/allergies/patients/${patientId}/allergies`, data);
    return response.data;
  },

  // Atualizar alergia
  updatePatientAllergy: async (patientId: string, allergyId: string, data: UpdateAllergyData) => {
    const response = await api.put<PatientAllergy>(`/allergies/patients/${patientId}/allergies/${allergyId}`, data);
    return response.data;
  },

  // Verificar alergias graves
  hasSevereActiveAllergies: async (patientId: string) => {
    const response = await api.get<PatientAllergy[]>(`/allergies/patients/${patientId}/severe-allergies`);
    return response.data;
  },

  // Verificar interação medicamentosa
  checkDrugInteraction: async (patientId: string, drugName: string) => {
    const response = await api.get<PatientAllergy[]>(`/allergies/patients/${patientId}/drug-interaction?drug=${encodeURIComponent(drugName)}`);
    return response.data;
  },
};
