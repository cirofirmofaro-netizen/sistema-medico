import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authService, User } from '../services/auth'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user

  // Verificar se há token válido na inicialização
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = authService.getToken()
        if (token) {
          // Tentar buscar dados atualizados do usuário
          const userData = await authService.getProfile()
          setUser(userData)
        }
      } catch (error) {
        // Se falhar, limpar dados inválidos
        authService.logout()
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password })
      setUser(response.usuario)
      // Forçar re-render
      setIsLoading(false)
    } catch (error) {
      // O erro já é tratado pelo interceptor do Axios
      throw error
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  const refreshUser = async () => {
    try {
      const userData = await authService.getProfile()
      setUser(userData)
    } catch (error) {
      // Se falhar, fazer logout
      logout()
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoading, 
      login, 
      logout, 
      refreshUser 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
