import { atom } from 'jotai'
import { User } from '@/types'

export const userAtom = atom<User | null>(null)

export function initializeAuth() {
  if (typeof window === 'undefined') return

  const savedUser = localStorage.getItem('user')
  if (savedUser) {
    // O jotai não tem método set direto, vamos usar o localStorage apenas
    // O atom será inicializado quando o componente for montado
  }
}

export async function login(email: string, password: string): Promise<boolean> {
  // Simular login - em produção, isso seria uma chamada para a API
  if (email === 'admin@exemplo.com' && password === '123456') {
    const userData: User = {
      id: '1',
      name: 'Dr. João Silva',
      email: 'admin@exemplo.com',
      specialty: 'Clínico Geral',
      role: 'doctor',
    }
    
    localStorage.setItem('user', JSON.stringify(userData))
    return true
  }
  return false
}

export function logout() {
  localStorage.removeItem('user')
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  
  const savedUser = localStorage.getItem('user')
  return !!savedUser
}
