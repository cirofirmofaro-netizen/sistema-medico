import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { X, Calendar, Clock, MapPin, Stethoscope, DollarSign, FileText } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { plantoesService, CreatePlantaoData } from '../../../services/plantoes'
import MaskedInput from '../../../components/ui/MaskedInput'
import Select from '../../../components/ui/Select'

const plantaoSchema = z.object({
  data: z.string().min(1, 'Data é obrigatória'),
  horaInicio: z.string().min(1, 'Hora de início é obrigatória'),
  duracao: z.number().min(1, 'Duração é obrigatória'),
  local: z.string().min(1, 'Local é obrigatório'),
  especialidade: z.string().min(1, 'Especialidade é obrigatória'),
  valor: z.string().min(1, 'Valor é obrigatório'),
  observacoes: z.string().optional(),
  horaFim: z.string().optional(),
})

type PlantaoFormData = z.infer<typeof plantaoSchema>

interface NewPlantaoDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function NewPlantaoDialog({ open, onClose, onSuccess }: NewPlantaoDialogProps) {
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<PlantaoFormData>({
    resolver: zodResolver(plantaoSchema),
    defaultValues: {
      data: new Date().toISOString().split('T')[0],
      duracao: 12,
      valor: '',
    }
  })

  const data = watch('data')
  const horaInicio = watch('horaInicio')
  const duracao = watch('duracao')

  // Calcular hora fim automaticamente
  useEffect(() => {
    if (data && horaInicio && duracao) {
      const inicio = new Date(`${data}T${horaInicio}`)
      const fim = new Date(inicio.getTime() + duracao * 60 * 60 * 1000)
      const horaFim = fim.toTimeString().slice(0, 5)
      setValue('horaFim', horaFim)
    }
  }, [data, horaInicio, duracao, setValue])

  const createMutation = useMutation({
    mutationFn: plantoesService.createPlantao,
    onSuccess: () => {
      toast.success('Plantão criado com sucesso!')
      reset()
      onSuccess()
    },
    onError: () => {
      toast.error('Erro ao criar plantão')
    }
  })

  const onSubmit = async (formData: PlantaoFormData) => {
    setIsSubmitting(true)
    try {
      // Calcular hora fim
      const inicio = new Date(`${formData.data}T${formData.horaInicio}`)
      const fim = new Date(inicio.getTime() + formData.duracao * 60 * 60 * 1000)
      const horaFim = fim.toTimeString().slice(0, 5)
      
      // Converter valor de string para number
      const valorNumerico = parseFloat(formData.valor.replace(/[^\d,]/g, '').replace(',', '.'))
      
      await createMutation.mutateAsync({
        ...formData,
        horaFim,
        valor: valorNumerico,
      })
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
          <h2 className="text-xl font-bold text-gray-900">Novo Plantão</h2>
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
          {/* Data e Horários */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Data
              </label>
              <input
                {...register('data')}
                type="date"
                className="input"
              />
              {errors.data && (
                <p className="mt-1 text-sm text-red-600">{errors.data.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Clock className="h-4 w-4 inline mr-1" />
                Hora Início
              </label>
              <input
                {...register('horaInicio')}
                type="time"
                className="input"
              />
              {errors.horaInicio && (
                <p className="mt-1 text-sm text-red-600">{errors.horaInicio.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Clock className="h-4 w-4 inline mr-1" />
                Duração (horas)
              </label>
              <Select
                value={duracao?.toString() || ''}
                onChange={(value) => setValue('duracao', parseInt(value))}
                options={[
                  { value: '6', label: '6 horas' },
                  { value: '12', label: '12 horas' },
                  { value: '24', label: '24 horas' },
                  { value: '36', label: '36 horas' },
                ]}
                error={errors.duracao?.message}
              />
            </div>
          </div>

          {/* Hora Fim (calculada automaticamente) */}
          {data && horaInicio && duracao && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Clock className="h-4 w-4 inline mr-1" />
                Hora Fim (calculada)
              </label>
              <input
                {...register('horaFim')}
                type="time"
                className="input bg-white"
                readOnly
              />
            </div>
          )}

          {/* Local e Especialidade */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <MapPin className="h-4 w-4 inline mr-1" />
                Local
              </label>
              <input
                {...register('local')}
                type="text"
                placeholder="Hospital, Clínica, etc."
                className="input"
              />
              {errors.local && (
                <p className="mt-1 text-sm text-red-600">{errors.local.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Stethoscope className="h-4 w-4 inline mr-1" />
                Especialidade
              </label>
              <select
                {...register('especialidade')}
                className="input"
              >
                <option value="">Selecione uma especialidade</option>
                <option value="CLINICO_GERAL">Clínico Geral</option>
                <option value="PEDIATRIA">Pediatria</option>
                <option value="CIRURGIA">Cirurgia</option>
                <option value="CARDIOLOGIA">Cardiologia</option>
                <option value="ORTOPEDIA">Ortopedia</option>
                <option value="NEUROLOGIA">Neurologia</option>
                <option value="PSIQUIATRIA">Psiquiatria</option>
                <option value="GINECOLOGIA">Ginecologia</option>
                <option value="OBSTETRICIA">Obstetrícia</option>
                <option value="UROLOGIA">Urologia</option>
                <option value="DERMATOLOGIA">Dermatologia</option>
                <option value="OFTALMOLOGIA">Oftalmologia</option>
                <option value="OTORRINOLARINGOLOGIA">Otorrinolaringologia</option>
                <option value="RADIOLOGIA">Radiologia</option>
                <option value="ANESTESIOLOGIA">Anestesiologia</option>
                <option value="EMERGENCIA">Emergência</option>
                <option value="UTI">UTI</option>
                <option value="OUTROS">Outros</option>
              </select>
              {errors.especialidade && (
                <p className="mt-1 text-sm text-red-600">{errors.especialidade.message}</p>
              )}
            </div>
          </div>

          {/* Valor */}
          <div>
            <MaskedInput
              mask="currency"
              value={watch('valor')}
              onChange={(value) => setValue('valor', value)}
              label="Valor (R$)"
              error={errors.valor?.message}
              placeholder="0,00"
            />
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FileText className="h-4 w-4 inline mr-1" />
              Observações
            </label>
            <textarea
              {...register('observacoes')}
              rows={3}
              placeholder="Observações adicionais..."
              className="input resize-none"
            />
            {errors.observacoes && (
              <p className="mt-1 text-sm text-red-600">{errors.observacoes.message}</p>
            )}
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
                  Criando...
                </div>
              ) : (
                'Criar Plantão'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
