import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { X, Save, FileText } from 'lucide-react'
import { evolutionsService } from '../../services/medicalRecords'

const evolutionSchema = z.object({
  resumo: z.string().min(1, 'Título é obrigatório'),
  texto: z.string().min(10, 'Conteúdo deve ter pelo menos 10 caracteres'),
})

type EvolutionFormData = z.infer<typeof evolutionSchema>

interface EvolutionFormProps {
  patientId: string
  onSuccess: () => void
  onCancel: () => void
  evolution?: {
    id: string
    resumo?: string
    texto: string
  }
}

export default function EvolutionForm({ patientId, onSuccess, onCancel, evolution }: EvolutionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<EvolutionFormData>({
    resolver: zodResolver(evolutionSchema),
    defaultValues: evolution ? {
      resumo: evolution.resumo || '',
      texto: evolution.texto,
    } : {
      resumo: '',
      texto: '',
    }
  })

  const onSubmit = async (data: EvolutionFormData) => {
    setIsSubmitting(true)
    try {
      console.log('Submetendo evolução:', { data, evolution, patientId })
      
      if (evolution) {
        // Atualizar evolução existente
        console.log('Atualizando evolução existente...')
        await evolutionsService.updateEvolution(patientId, {
          id: evolution.id,
          ...data
        })
        toast.success('Evolução atualizada com sucesso!')
      } else {
        // Criar nova evolução
        console.log('Criando nova evolução...')
        await evolutionsService.createEvolution({
          patientId,
          ...data
        })
        toast.success('Evolução criada com sucesso!')
      }

      reset()
      onSuccess()
    } catch (error) {
      console.error('Erro detalhado:', error)
      console.error('Erro completo:', JSON.stringify(error, null, 2))
      toast.error('Erro ao salvar evolução')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-primary-600" />
            <h2 className="text-xl font-bold text-gray-900">
              {evolution ? 'Editar Evolução' : 'Nova Evolução'}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Título *
            </label>
            <input
              {...register('resumo')}
              type="text"
              placeholder="Ex: Primeira consulta, Retorno, Evolução..."
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.resumo ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.resumo && (
              <p className="mt-1 text-sm text-red-600">{errors.resumo.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Conteúdo *
            </label>
            <textarea
              {...register('texto')}
              rows={8}
              placeholder="Descreva a evolução do paciente, sintomas, exames, prescrições..."
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none ${
                errors.texto ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.texto && (
              <p className="mt-1 text-sm text-red-600">{errors.texto.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{isSubmitting ? 'Salvando...' : 'Salvar Evolução'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
