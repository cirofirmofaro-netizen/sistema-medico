import { api } from './api';

export type Paciente = {
  id: string; 
  nome: string; 
  dtNasc?: string; 
  sexo?: string;
  cpf?: string; 
  telefone?: string; 
  email?: string; 
  endereco?: string;
};

export async function listPacientes(search?: string) {
  const { data } = await api.get<Paciente[]>('/pacientes', { params: { search } });
  return data;
}

export async function createPaciente(payload: Omit<Paciente,'id'>) {
  const { data } = await api.post('/pacientes', payload); 
  return data;
}

export async function getPaciente(id: string) {
  const { data } = await api.get<Paciente>(`/pacientes/${id}`);
  return data;
}
