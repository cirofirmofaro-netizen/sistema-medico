import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { X, User, Calendar, Phone, Mail, MapPin, Hash, Search, Loader2 } from 'lucide-react'
import { pacientesService } from '../../../services/pacientes'
import MaskedInput from '../../../components/ui/MaskedInput'
import DatePicker from '../../../components/ui/DatePicker'
import Select from '../../../components/ui/Select'

const pacienteSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  dtNasc: z.string().optional(),
  sexo: z.string().min(1, 'Selecione o sexo'),
  cpf: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  // Campos de endereço separados
  cep: z.string().optional(),
  rua: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  uf: z.string().optional(),
})

type PacienteFormData = z.infer<typeof pacienteSchema>

interface PatientFormProps {
  open: boolean
  paciente?: any // Para edição
  onClose: () => void
  onSuccess: () => void
}

interface ViaCepResponse {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
}

export default function PatientForm({ open, paciente, onClose, onSuccess }: PatientFormProps) {
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingCep, setIsLoadingCep] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<PacienteFormData>({
    resolver: zodResolver(pacienteSchema),
    defaultValues: {
      sexo: '',
    }
  })

  const cep = watch('cep')

  // Carregar dados do paciente para edição
  useEffect(() => {
    if (paciente) {
      setValue('nome', paciente.nome || '')
      setValue('dtNasc', paciente.dtNasc ? new Date(paciente.dtNasc).toISOString().split('T')[0] : '')
      setValue('sexo', paciente.sexo || '')
      setValue('cpf', paciente.cpf || '')
      setValue('telefone', paciente.telefone || '')
      setValue('email', paciente.email || '')
      
      // Se o endereço estiver em um campo único, tentar separar
      if (paciente.endereco) {
        // Aqui você pode implementar lógica para separar o endereço
        // Por enquanto, vamos deixar vazio
      }
    } else {
      reset()
    }
  }, [paciente, setValue, reset])

  // Buscar CEP via ViaCEP
  const buscarCep = async (cepValue: string) => {
    if (!cepValue || cepValue.length !== 8) return

    setIsLoadingCep(true)
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepValue}/json/`)
      const data: ViaCepResponse = await response.json()

      if (data.logradouro) {
        setValue('rua', data.logradouro || '')
        setValue('bairro', data.bairro || '')
        setValue('cidade', data.localidade || '')
        setValue('uf', data.uf || '')
        toast.success('Endereço preenchido automaticamente!')
      } else {
        toast.error('CEP não encontrado')
      }
    } catch (error) {
      toast.error('Erro ao buscar CEP')
    } finally {
      setIsLoadingCep(false)
    }
  }

  // Buscar CEP quando o campo for preenchido
  useEffect(() => {
    if (cep && cep.length === 8) {
      buscarCep(cep)
    }
  }, [cep])

  const createMutation = useMutation({
    mutationFn: (data: PacienteFormData) => {
      // Combinar campos de endereço
      const endereco = [
        data.rua,
        data.numero,
        data.complemento,
        data.bairro,
        data.cidade,
        data.uf
      ].filter(Boolean).join(', ')

      const pacienteData = {
        nome: data.nome,
        dtNasc: data.dtNasc ? new Date(data.dtNasc).toISOString() : undefined,
        sexo: data.sexo,
        cpf: data.cpf,
        telefone: data.telefone,
        email: data.email || undefined,
        endereco: endereco || undefined,
      }

      return paciente ? 
        pacientesService.updatePaciente({ id: paciente.id, ...pacienteData }) :
        pacientesService.createPaciente(pacienteData)
    },
    onSuccess: () => {
      toast.success(paciente ? 'Paciente atualizado com sucesso!' : 'Paciente criado com sucesso!')
      reset()
      onSuccess()
    },
    onError: () => {
      toast.error(paciente ? 'Erro ao atualizar paciente' : 'Erro ao criar paciente')
    }
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {paciente ? 'Editar Paciente' : 'Novo Paciente'}
          </h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Informações Pessoais */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Pessoais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nome */}
              <div className="md:col-span-2">
                <div className="relative">
                  <input
                    {...register('nome')}
                    type="text"
                    className="input pl-10"
                    placeholder="Nome completo"
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                {errors.nome && (
                  <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>
                )}
              </div>

              {/* Data de Nascimento */}
              <div>
                                  <DatePicker
                    value={watch('dtNasc') || ''}
                    onChange={(value) => setValue('dtNasc', value)}
                    label="Data de Nascimento"
                    error={errors.dtNasc?.message}
                  />
              </div>

              {/* Sexo */}
              <div>
                <Select
                  value={watch('sexo')}
                  onChange={(value) => setValue('sexo', value)}
                  options={[
                    { value: 'F', label: 'Feminino' },
                    { value: 'M', label: 'Masculino' },
                    { value: 'O', label: 'Outros' },
                  ]}
                  label="Sexo"
                  error={errors.sexo?.message}
                  placeholder="Selecione o sexo"
                />
              </div>

              {/* CPF */}
              <div>
                <MaskedInput
                  mask="cpf"
                  value={watch('cpf') || ''}
                  onChange={(value) => setValue('cpf', value)}
                  label="CPF"
                  error={errors.cpf?.message}
                  placeholder="000.000.000-00"
                />
              </div>

              {/* Telefone */}
              <div>
                <MaskedInput
                  mask="phone"
                  value={watch('telefone') || ''}
                  onChange={(value) => setValue('telefone', value)}
                  label="Telefone"
                  error={errors.telefone?.message}
                  placeholder="(00) 00000-0000"
                />
              </div>

              {/* Email */}
              <div className="md:col-span-2">
                <div className="relative">
                  <input
                    {...register('email')}
                    type="email"
                    className="input pl-10"
                    placeholder="Email"
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Endereço</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* CEP */}
              <div>
                <div className="relative">
                  <input
                    {...register('cep')}
                    type="text"
                    className="input pl-10 pr-10"
                    placeholder="00000-000"
                    maxLength={8}
                  />
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  {isLoadingCep && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
                  )}
                </div>
                {errors.cep && (
                  <p className="mt-1 text-sm text-red-600">{errors.cep.message}</p>
                )}
              </div>

              {/* Rua */}
              <div className="md:col-span-2">
                <input
                  {...register('rua')}
                  type="text"
                  className="input"
                  placeholder="Rua/Avenida"
                />
                {errors.rua && (
                  <p className="mt-1 text-sm text-red-600">{errors.rua.message}</p>
                )}
              </div>

              {/* Número */}
              <div>
                <input
                  {...register('numero')}
                  type="text"
                  className="input"
                  placeholder="Número"
                />
                {errors.numero && (
                  <p className="mt-1 text-sm text-red-600">{errors.numero.message}</p>
                )}
              </div>

              {/* Complemento */}
              <div className="md:col-span-2">
                <input
                  {...register('complemento')}
                  type="text"
                  className="input"
                  placeholder="Complemento (apartamento, bloco, etc.)"
                />
                {errors.complemento && (
                  <p className="mt-1 text-sm text-red-600">{errors.complemento.message}</p>
                )}
              </div>

              {/* Bairro */}
              <div>
                <input
                  {...register('bairro')}
                  type="text"
                  className="input"
                  placeholder="Bairro"
                />
                {errors.bairro && (
                  <p className="mt-1 text-sm text-red-600">{errors.bairro.message}</p>
                )}
              </div>

              {/* Cidade */}
              <div>
                <input
                  {...register('cidade')}
                  type="text"
                  className="input"
                  placeholder="Cidade"
                />
                {errors.cidade && (
                  <p className="mt-1 text-sm text-red-600">{errors.cidade.message}</p>
                )}
              </div>

              {/* UF */}
              <div>
                <Select
                  value={watch('uf') || ''}
                  onChange={(value) => setValue('uf', value)}
                  options={[
                    { value: 'AC', label: 'Acre' },
                    { value: 'AL', label: 'Alagoas' },
                    { value: 'AP', label: 'Amapá' },
                    { value: 'AM', label: 'Amazonas' },
                    { value: 'BA', label: 'Bahia' },
                    { value: 'CE', label: 'Ceará' },
                    { value: 'DF', label: 'Distrito Federal' },
                    { value: 'ES', label: 'Espírito Santo' },
                    { value: 'GO', label: 'Goiás' },
                    { value: 'MA', label: 'Maranhão' },
                    { value: 'MT', label: 'Mato Grosso' },
                    { value: 'MS', label: 'Mato Grosso do Sul' },
                    { value: 'MG', label: 'Minas Gerais' },
                    { value: 'PA', label: 'Pará' },
                    { value: 'PB', label: 'Paraíba' },
                    { value: 'PR', label: 'Paraná' },
                    { value: 'PE', label: 'Pernambuco' },
                    { value: 'PI', label: 'Piauí' },
                    { value: 'RJ', label: 'Rio de Janeiro' },
                    { value: 'RN', label: 'Rio Grande do Norte' },
                    { value: 'RS', label: 'Rio Grande do Sul' },
                    { value: 'RO', label: 'Rondônia' },
                    { value: 'RR', label: 'Roraima' },
                    { value: 'SC', label: 'Santa Catarina' },
                    { value: 'SP', label: 'São Paulo' },
                    { value: 'SE', label: 'Sergipe' },
                    { value: 'TO', label: 'Tocantins' },
                  ]}
                  placeholder="UF"
                  error={errors.uf?.message}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {paciente ? 'Atualizando...' : 'Criando...'}
                </div>
              ) : (
                paciente ? 'Atualizar Paciente' : 'Criar Paciente'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
