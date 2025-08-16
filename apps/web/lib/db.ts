import { atom } from 'jotai'
import { mockPatients } from './mock/patients'
import { mockShifts } from './mock/shifts'
import { Patient, Shift, VitalSigns, Evolution } from '@/types'

// Atoms para dados
export const patientsAtom = atom<Patient[]>([])
export const shiftsAtom = atom<Shift[]>([])
export const vitalSignsAtom = atom<VitalSigns[]>([])
export const evolutionsAtom = atom<Evolution[]>([])

// Função para inicializar dados do localStorage
export function initializeData() {
  if (typeof window === 'undefined') return

  // Carregar pacientes
  const savedPatients = localStorage.getItem('patients')
  if (!savedPatients) {
    localStorage.setItem('patients', JSON.stringify(mockPatients))
  }

  // Carregar plantões
  const savedShifts = localStorage.getItem('shifts')
  if (!savedShifts) {
    localStorage.setItem('shifts', JSON.stringify(mockShifts))
  }

  // Carregar sinais vitais
  const savedVitalSigns = localStorage.getItem('vitalSigns')
  if (!savedVitalSigns) {
    localStorage.setItem('vitalSigns', JSON.stringify([]))
  }

  // Carregar evoluções
  const savedEvolutions = localStorage.getItem('evolutions')
  if (!savedEvolutions) {
    localStorage.setItem('evolutions', JSON.stringify([]))
  }
}

// Função para salvar dados no localStorage
export function saveData() {
  if (typeof window === 'undefined') return

  // Esta função será implementada quando necessário
  // Por enquanto, os dados são salvos diretamente no localStorage
}
