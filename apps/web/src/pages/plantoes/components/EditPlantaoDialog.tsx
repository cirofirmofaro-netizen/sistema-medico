import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { X, Calendar, Clock, MapPin, Stethoscope, DollarSign, FileText } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { plantoesService, Plantao, UpdatePlantaoData } from '../../../services/plantoes'

const plantaoSchema = z.object({
  data: z.string().min(1, 'Data é obrigatória'),
  horaInicio: z.string().min(1, 'Hora de início é obrigatória'),
  horaFim: z.string().min(1, 'Hora de fim é obrigatória'),
  local: z.string().min(1, 'Local é obrigatório'),
  especialidade: z.string().min(1, 'Especialidade é obrigatória'),
  valor: z.number().min(0, 'Valor deve ser maior que zero'),
  observacoes: z.string().optional(),
  status: z.enum(['PENDENTE', 'CONFIRMADO', 'CANCELADO', 'REALIZADO']),
}).refine((data) => {
  // Validar que fim > início (permitindo atravessar meia-noite)
  const [inicioHora, inicioMin] = data.horaInicio.split(':').map(Number);
  const [fimHora, fimMin] = data.horaFim.split(':').map(Number);
  
  // Converter para minutos desde meia-noite
  const inicioMinutos = inicioHora * 60 + inicioMin;
  const fimMinutos = fimHora * 60 + fimMin;
  
  // Se fim < início, significa que atravessa meia-noite (válido)
  // Se fim = início, significa duração zero (inválido)
  return fimMinutos !== inicioMinutos;
}, {
  message: 'Hora de fim não pode ser igual à hora de início',
  path: ['horaFim']
})

type PlantaoFormData = z.infer<typeof plantaoSchema>

interface EditPlantaoDialogProps {
  open: boolean
  plantao: Plantao | null
  onClose: () => void
  onSuccess: () => void
}

export default function EditPlantaoDialog({ open, plantao, onClose, onSuccess }: EditPlantaoDialogProps) {
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<PlantaoFormData>({
    resolver: zodResolver(plantaoSchema),
  })

  // Preencher formulário quando plantão mudar
  useEffect(() => {
    if (plantao) {
      setValue('data', plantao.data)
      setValue('horaInicio', plantao.horaInicio)
      setValue('horaFim', plantao.horaFim)
      setValue('local', plantao.local)
      setValue('especialidade', plantao.especialidade)
      setValue('valor', plantao.valor)
      setValue('observacoes', plantao.observacoes || '')
      setValue('status', plantao.status)
    }
  }, [plantao, setValue])

  const updateMutation = useMutation({
    mutationFn: plantoesService.updatePlantao,
    onSuccess: () => {
      toast.success('Plantão atualizado com sucesso!')
      onSuccess()
    },
    onError: () => {
      toast.error('Erro ao atualizar plantão')
    }
  })

  const onSubmit = async (data: PlantaoFormData) => {
    if (!plantao) return
    
    setIsSubmitting(true)
    try {
      const updateData: UpdatePlantaoData = {
        id: plantao.id,
        ...data
      }
      await updateMutation.mutateAsync(updateData)
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

  if (!open || !plantao) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Editar Plantão</h2>
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
          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Status
            </label>
            <select
              {...register('status')}
              className="input"
            >
              <option value="PENDENTE">Pendente</option>
              <option value="CONFIRMADO">Confirmado</option>
              <option value="CANCELADO">Cancelado</option>
              <option value="REALIZADO">Realizado</option>
            </select>
            {errors.status && (
              <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
            )}
          </div>

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
                Hora Fim
              </label>
              <input
                {...register('horaFim')}
                type="time"
                className="input"
              />
              {errors.horaFim && (
                <p className="mt-1 text-sm text-red-600">{errors.horaFim.message}</p>
              )}
            </div>
          </div>

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
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <DollarSign className="h-4 w-4 inline mr-1" />
              Valor (R$)
            </label>
            <input
              {...register('valor', { valueAsNumber: true })}
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              className="input"
            />
            {errors.valor && (
              <p className="mt-1 text-sm text-red-600">{errors.valor.message}</p>
            )}
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
                  Salvando...
                </div>
              ) : (
                'Salvar Alterações'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
