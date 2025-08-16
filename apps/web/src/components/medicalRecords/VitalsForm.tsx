import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Save, X, Activity } from 'lucide-react'

const vitalsSchema = z.object({
  data: z.string().min(1, 'Data é obrigatória'),
  pressaoSistolica: z.number().min(0).max(300).optional(),
  pressaoDiastolica: z.number().min(0).max(200).optional(),
  frequenciaCardiaca: z.number().min(0).max(300).optional(),
  frequenciaRespiratoria: z.number().min(0).max(100).optional(),
  saturacaoOxigenio: z.number().min(0).max(100).optional(),
  temperatura: z.number().min(30).max(45).optional(),
  peso: z.number().min(0).max(500).optional(),
  altura: z.number().min(0).max(300).optional(),
  observacoes: z.string().optional()
})

type VitalsFormData = z.infer<typeof vitalsSchema>

interface VitalsFormProps {
  patientId: string
  vitals?: {
    id: string
    data: string
    pressaoSistolica: number | null
    pressaoDiastolica: number | null
    frequenciaCardiaca: number | null
    frequenciaRespiratoria: number | null
    saturacaoOxigenio: number | null
    temperatura: number | null
    peso: number | null
    altura: number | null
    observacoes: string | null
  }
  onSave: (data: VitalsFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function VitalsForm({ 
  patientId, 
  vitals, 
  onSave, 
  onCancel, 
  isLoading = false 
}: VitalsFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<VitalsFormData>({
    resolver: zodResolver(vitalsSchema),
    defaultValues: {
      data: vitals?.data || new Date().toISOString().split('T')[0],
      pressaoSistolica: vitals?.pressaoSistolica || undefined,
      pressaoDiastolica: vitals?.pressaoDiastolica || undefined,
      frequenciaCardiaca: vitals?.frequenciaCardiaca || undefined,
      frequenciaRespiratoria: vitals?.frequenciaRespiratoria || undefined,
      saturacaoOxigenio: vitals?.saturacaoOxigenio || undefined,
      temperatura: vitals?.temperatura || undefined,
      peso: vitals?.peso || undefined,
      altura: vitals?.altura || undefined,
      observacoes: vitals?.observacoes || ''
    }
  })

  const watchedPeso = watch('peso')
  const watchedAltura = watch('altura')

  const calculateIMC = () => {
    if (watchedPeso && watchedAltura) {
      const alturaMetros = watchedAltura / 100
      return (watchedPeso / (alturaMetros * alturaMetros)).toFixed(1)
    }
    return null
  }

  const onSubmit = async (data: VitalsFormData) => {
    try {
      await onSave(data)
      toast.success(vitals ? 'Sinais vitais atualizados!' : 'Sinais vitais registrados!')
    } catch (error) {
      toast.error('Erro ao salvar sinais vitais')
    }
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          {vitals ? 'Editar Sinais Vitais' : 'Novos Sinais Vitais'}
        </h3>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Data */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Data *
          </label>
          <input
            type="date"
            {...register('data')}
            className={`input ${errors.data ? 'border-red-500' : ''}`}
          />
          {errors.data && (
            <p className="mt-1 text-sm text-red-600">{errors.data.message}</p>
          )}
        </div>

        {/* Pressão Arterial */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Pressão Sistólica (mmHg)
            </label>
            <input
              type="number"
              {...register('pressaoSistolica', { valueAsNumber: true })}
              className={`input ${errors.pressaoSistolica ? 'border-red-500' : ''}`}
              placeholder="120"
              min="0"
              max="300"
            />
            {errors.pressaoSistolica && (
              <p className="mt-1 text-sm text-red-600">{errors.pressaoSistolica.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Pressão Diastólica (mmHg)
            </label>
            <input
              type="number"
              {...register('pressaoDiastolica', { valueAsNumber: true })}
              className={`input ${errors.pressaoDiastolica ? 'border-red-500' : ''}`}
              placeholder="80"
              min="0"
              max="200"
            />
            {errors.pressaoDiastolica && (
              <p className="mt-1 text-sm text-red-600">{errors.pressaoDiastolica.message}</p>
            )}
          </div>
        </div>

        {/* Frequência Cardíaca e Respiratória */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Frequência Cardíaca (bpm)
            </label>
            <input
              type="number"
              {...register('frequenciaCardiaca', { valueAsNumber: true })}
              className={`input ${errors.frequenciaCardiaca ? 'border-red-500' : ''}`}
              placeholder="80"
              min="0"
              max="300"
            />
            {errors.frequenciaCardiaca && (
              <p className="mt-1 text-sm text-red-600">{errors.frequenciaCardiaca.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Frequência Respiratória (irpm)
            </label>
            <input
              type="number"
              {...register('frequenciaRespiratoria', { valueAsNumber: true })}
              className={`input ${errors.frequenciaRespiratoria ? 'border-red-500' : ''}`}
              placeholder="16"
              min="0"
              max="100"
            />
            {errors.frequenciaRespiratoria && (
              <p className="mt-1 text-sm text-red-600">{errors.frequenciaRespiratoria.message}</p>
            )}
          </div>
        </div>

        {/* Saturação e Temperatura */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Saturação de Oxigênio (%)
            </label>
            <input
              type="number"
              {...register('saturacaoOxigenio', { valueAsNumber: true })}
              className={`input ${errors.saturacaoOxigenio ? 'border-red-500' : ''}`}
              placeholder="98"
              min="0"
              max="100"
            />
            {errors.saturacaoOxigenio && (
              <p className="mt-1 text-sm text-red-600">{errors.saturacaoOxigenio.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Temperatura (°C)
            </label>
            <input
              type="number"
              step="0.1"
              {...register('temperatura', { valueAsNumber: true })}
              className={`input ${errors.temperatura ? 'border-red-500' : ''}`}
              placeholder="36.5"
              min="30"
              max="45"
            />
            {errors.temperatura && (
              <p className="mt-1 text-sm text-red-600">{errors.temperatura.message}</p>
            )}
          </div>
        </div>

        {/* Peso e Altura */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Peso (kg)
            </label>
            <input
              type="number"
              step="0.1"
              {...register('peso', { valueAsNumber: true })}
              className={`input ${errors.peso ? 'border-red-500' : ''}`}
              placeholder="70.0"
              min="0"
              max="500"
            />
            {errors.peso && (
              <p className="mt-1 text-sm text-red-600">{errors.peso.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Altura (cm)
            </label>
            <input
              type="number"
              {...register('altura', { valueAsNumber: true })}
              className={`input ${errors.altura ? 'border-red-500' : ''}`}
              placeholder="170"
              min="0"
              max="300"
            />
            {errors.altura && (
              <p className="mt-1 text-sm text-red-600">{errors.altura.message}</p>
            )}
          </div>
        </div>

        {/* IMC Calculado */}
        {calculateIMC() && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-blue-900">IMC Calculado:</span>
              <span className="text-lg font-bold text-blue-700">{calculateIMC()} kg/m²</span>
            </div>
            <div className="mt-2 text-xs text-blue-600">
              {(() => {
                const imc = parseFloat(calculateIMC()!)
                if (imc < 18.5) return 'Abaixo do peso'
                if (imc < 25) return 'Peso normal'
                if (imc < 30) return 'Sobrepeso'
                if (imc < 35) return 'Obesidade grau I'
                if (imc < 40) return 'Obesidade grau II'
                return 'Obesidade grau III'
              })()}
            </div>
          </div>
        )}

        {/* Observações */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Observações
          </label>
          <textarea
            {...register('observacoes')}
            rows={3}
            className="input resize-none"
            placeholder="Observações adicionais sobre os sinais vitais..."
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary flex items-center"
            disabled={isSubmitting || isLoading}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary flex items-center"
            disabled={isSubmitting || isLoading}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting || isLoading ? 'Salvando...' : 'Salvar Sinais Vitais'}
          </button>
        </div>
      </form>
    </div>
  )
}
