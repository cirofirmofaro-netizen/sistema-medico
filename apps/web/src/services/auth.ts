import api from '../lib/api'

export interface LoginData {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  usuario: {
    id: string
    email: string
    nome: string
    tipo: string
    especialidade?: string
    crm?: string
  }
}

export interface User {
  id: string
  email: string
  nome: string
  tipo: string
  especialidade?: string
  crm?: string
}

export const authService = {
  async login(data: LoginData): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', {
      email: data.email,
      senha: data.password,
    })
    
    // Salvar token no localStorage
    localStorage.setItem('token', response.data.access_token)
    localStorage.setItem('user', JSON.stringify(response.data.usuario))
    
    return response.data
  },

  async register(data: any): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/register', data)
    
    // Salvar token no localStorage
    localStorage.setItem('token', response.data.access_token)
    localStorage.setItem('user', JSON.stringify(response.data.usuario))
    
    return response.data
  },

  async getProfile(): Promise<User> {
    const response = await api.get<User>('/auth/profile')
    return response.data
  },

  logout(): void {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  getToken(): string | null {
    return localStorage.getItem('token')
  },

  getUser(): User | null {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },

  isAuthenticated(): boolean {
    return !!this.getToken()
  }
}
