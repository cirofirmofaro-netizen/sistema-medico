import axios from 'axios'
import { toast } from 'sonner'

// Configuração base do Axios
const api = axios.create({
  baseURL: '/api', // Usar proxy do Vite
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para adicionar token JWT em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          // Token expirado ou inválido
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          window.location.href = '/login'
          toast.error('Sessão expirada. Faça login novamente.')
          break
        case 403:
          toast.error('Acesso negado.')
          break
        case 404:
          toast.error('Recurso não encontrado.')
          break
        case 422:
          // Erro de validação
          const errors = data?.message || 'Dados inválidos'
          if (Array.isArray(errors)) {
            errors.forEach((error: string) => toast.error(error))
          } else {
            toast.error(errors)
          }
          break
        case 500:
          toast.error('Erro interno do servidor.')
          break
        default:
          toast.error(data?.message || 'Erro inesperado.')
      }
    } else if (error.request) {
      toast.error('Erro de conexão. Verifique sua internet.')
    } else {
      toast.error('Erro inesperado.')
    }
    
    return Promise.reject(error)
  }
)

export default api
