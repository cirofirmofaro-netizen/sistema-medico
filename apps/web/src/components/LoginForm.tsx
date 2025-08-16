import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Eye, EyeOff, User, Lock, Heart } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password)
      toast.success('Login realizado com sucesso!')
      console.log('Login realizado, redirecionando...')
    } catch (error) {
      // O erro já é tratado pelo interceptor do Axios
      console.error('Erro no login:', error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        {/* Logo e título */}
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center shadow-2xl mb-6">
            <Heart className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            Plantão Médico
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Faça login para acessar o sistema
          </p>
        </div>
        
        {/* Formulário */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Campo Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <input
                  {...register('email')}
                  type="email"
                  className="input pl-12"
                  placeholder="seu@email.com"
                />
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 animate-bounce-in">{errors.email.message}</p>
              )}
            </div>

            {/* Campo Senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className="input pl-12 pr-12"
                  placeholder="••••••••"
                />
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 animate-bounce-in">{errors.password.message}</p>
              )}
            </div>

            {/* Botão de Login */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary w-full flex justify-center items-center text-base font-semibold py-3"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Entrando...
                  </div>
                ) : (
                  'Entrar no Sistema'
                )}
              </button>
            </div>

            {/* Credenciais de teste */}
            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                <p className="text-sm font-medium text-blue-800 mb-2">Credenciais de Teste</p>
                <div className="space-y-1">
                  <p className="text-xs text-blue-600">
                    👨‍⚕️ Dr. João: <span className="font-mono">joao@exemplo.com</span>
                  </p>
                  <p className="text-xs text-blue-600">
                    👩‍⚕️ Dra. Maria: <span className="font-mono">maria@exemplo.com</span>
                  </p>
                  <p className="text-xs text-blue-600 font-medium">
                    Senha: <span className="font-mono">123456</span>
                  </p>
                </div>
                <p className="text-xs text-blue-500 mt-2">
                  🔒 Cada usuário tem seus próprios dados isolados
                </p>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            © 2024 Sistema de Plantão Médico. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  )
}
