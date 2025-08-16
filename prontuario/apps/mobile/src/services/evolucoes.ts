import { api } from './api';

export async function criarEpisodio(pacienteId: string, tipo='consulta') {
  const { data } = await api.post('/episodios', { pacienteId, tipo }); 
  return data;
}

export async function episodiosPorPaciente(pacienteId: string) {
  const { data } = await api.get(`/episodios/por-paciente/${pacienteId}`); 
  return data;
}

export async function evolucoesPorEpisodio(episodioId: string) {
  const { data } = await api.get(`/evolucoes/por-episodio/${episodioId}`); 
  return data;
}

export async function criarEvolucao(payload: { episodioId:string; resumo:string; texto:string; sinaisVitais?: any }) {
  const { data } = await api.post('/evolucoes', payload); 
  return data;
}
