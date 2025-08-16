import { pacientesService } from '../services/pacientes'

// Re-exportar as funções individuais para facilitar o uso
export const listPacientes = pacientesService.listPacientes
export const getPaciente = pacientesService.getPaciente
export const createPaciente = pacientesService.createPaciente
export const updatePaciente = pacientesService.updatePaciente
export const deletePaciente = pacientesService.deletePaciente

// Também exportar o serviço completo
export { pacientesService }
