import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { X, Calendar } from 'lucide-react'
import { conditionsService, CreateOccurrenceData } from '../../services/conditions'

const occurrenceFormSchema = z.object({
  startAt: z.string().min(1, 'Data de início é obrigatória'),
  endAt: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => {
  if (data.startAt && data.endAt) {
    return new Date(data.startAt) <= new Date(data.endAt)
  }
  return true
}, {
  message: 'Data de fim deve ser posterior à data de início',
  path: ['endAt']
})

type OccurrenceFormData = z.infer<typeof occurrenceFormSchema>

interface OccurrenceFormProps {
  patientId: string
  conditionId: string
  onSuccess: () => void
  onCancel: () => void
}

export default function OccurrenceForm({ patientId, conditionId, onSuccess, onCancel }: OccurrenceFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<OccurrenceFormData>({
    resolver: zodResolver(occurrenceFormSchema),
    defaultValues: {
      startAt: new Date().toLocaleDateString('en-CA'), // Today as default (YYYY-MM-DD format)
    }
  })

  const onSubmit = async (data: OccurrenceFormData) => {
    try {
      await conditionsService.createOccurrence(patientId, conditionId, data as CreateOccurrenceData)
      toast.success('Episódio adicionado com sucesso!')
      onSuccess()
    } catch (error) {
      toast.error('Erro ao adicionar episódio')
      console.error(error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Novo Episódio
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data de Início *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                {...register('startAt')}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            {errors.startAt && (
              <p className="mt-1 text-sm text-red-600">{errors.startAt.message}</p>
            )}
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data de Fim
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                {...register('endAt')}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            {errors.endAt && (
              <p className="mt-1 text-sm text-red-600">{errors.endAt.message}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Deixe em branco se o episódio ainda está ativo
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Observações sobre este episódio..."
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Salvando...' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
