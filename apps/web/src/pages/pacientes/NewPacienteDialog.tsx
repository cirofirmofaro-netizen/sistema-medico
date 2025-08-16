import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { X, User, Calendar, Phone, Mail, MapPin, Hash } from 'lucide-react'
import { pacientesService } from '../../services/pacientes'
import { CreatePacienteData } from '../../types'

const pacienteSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  dtNasc: z.string().optional(),
  sexo: z.enum(['M', 'F']).optional(),
  cpf: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  endereco: z.string().optional(),
})

type PacienteFormData = z.infer<typeof pacienteSchema>

interface NewPacienteDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function NewPacienteDialog({ open, onClose, onSuccess }: NewPacienteDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PacienteFormData>({
    resolver: zodResolver(pacienteSchema),
  })

  const createMutation = useMutation({
    mutationFn: pacientesService.createPaciente,
    onSuccess: () => {
      toast.success('Paciente criado com sucesso!')
      reset()
      onSuccess()
    },
    onError: () => {
      toast.error('Erro ao criar paciente')
    },
  })

  const onSubmit = async (data: PacienteFormData) => {
    setIsSubmitting(true)
    try {
      await createMutation.mutateAsync(data)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      reset()
      onClose()
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleClose} />
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Novo Paciente</h3>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo *
                </label>
                <div className="relative">
                  <input
                    {...register('nome')}
                    type="text"
                    className="input pl-10"
                    placeholder="Digite o nome completo"
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                {errors.nome && (
                  <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>
                )}
              </div>

              {/* Data de Nascimento e Sexo */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Nascimento
                  </label>
                  <div className="relative">
                    <input
                      {...register('dtNasc')}
                      type="date"
                      className="input pl-10"
                    />
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sexo
                  </label>
                  <select
                    {...register('sexo')}
                    className="input"
                  >
                    <option value="">Selecione</option>
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                  </select>
                </div>
              </div>

              {/* CPF */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CPF
                </label>
                <div className="relative">
                  <input
                    {...register('cpf')}
                    type="text"
                    className="input pl-10"
                    placeholder="000.000.000-00"
                  />
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Telefone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <div className="relative">
                  <input
                    {...register('telefone')}
                    type="tel"
                    className="input pl-10"
                    placeholder="(00) 00000-0000"
                  />
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <input
                    {...register('email')}
                    type="email"
                    className="input pl-10"
                    placeholder="email@exemplo.com"
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Endereço */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Endereço
                </label>
                <div className="relative">
                  <textarea
                    {...register('endereco')}
                    rows={3}
                    className="input pl-10 resize-none"
                    placeholder="Digite o endereço completo"
                  />
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                </div>
              </div>
            </form>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="btn btn-primary w-full sm:w-auto sm:ml-3"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Criando...</span>
                </div>
              ) : (
                'Criar Paciente'
              )}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="btn btn-secondary w-full sm:w-auto mt-3 sm:mt-0"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
