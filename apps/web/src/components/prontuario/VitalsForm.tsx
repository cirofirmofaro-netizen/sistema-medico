import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { X, Save, Activity } from 'lucide-react'
import { vitalsService } from '../../services/medicalRecords'

const vitalsSchema = z.object({
  pressaoSistolica: z.number().min(50, 'Pressão sistólica deve ser maior que 50').max(300, 'Pressão sistólica deve ser menor que 300'),
  pressaoDiastolica: z.number().min(30, 'Pressão diastólica deve ser maior que 30').max(200, 'Pressão diastólica deve ser menor que 200'),
  frequenciaCardiaca: z.number().min(40, 'Frequência cardíaca deve ser maior que 40').max(250, 'Frequência cardíaca deve ser menor que 250'),
  frequenciaRespiratoria: z.number().min(8, 'Frequência respiratória deve ser maior que 8').max(60, 'Frequência respiratória deve ser menor que 60'),
  saturacaoOxigenio: z.number().min(70, 'Saturação de oxigênio deve ser maior que 70').max(100, 'Saturação de oxigênio deve ser menor que 100'),
  temperatura: z.number().min(30, 'Temperatura deve ser maior que 30').max(45, 'Temperatura deve ser menor que 45'),
  peso: z.number().optional(),
  altura: z.number().optional(),
  observacoes: z.string().optional(),
})

type VitalsFormData = z.infer<typeof vitalsSchema>

interface VitalsFormProps {
  patientId: string
  onSuccess: () => void
  onCancel: () => void
  vitals?: {
    id: string
    pressaoSistolica: number
    pressaoDiastolica: number
    frequenciaCardiaca: number
    frequenciaRespiratoria: number
    saturacaoOxigenio: number
    temperatura: number
    peso?: number
    altura?: number
    observacoes?: string
  }
}

export default function VitalsForm({ patientId, onSuccess, onCancel, vitals }: VitalsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<VitalsFormData>({
    resolver: zodResolver(vitalsSchema),
    defaultValues: vitals ? {
      pressaoSistolica: vitals.pressaoSistolica,
      pressaoDiastolica: vitals.pressaoDiastolica,
      frequenciaCardiaca: vitals.frequenciaCardiaca,
      frequenciaRespiratoria: vitals.frequenciaRespiratoria,
      saturacaoOxigenio: vitals.saturacaoOxigenio,
      temperatura: vitals.temperatura,
      peso: vitals.peso,
      altura: vitals.altura,
      observacoes: vitals.observacoes,
    } : {
      pressaoSistolica: 0,
      pressaoDiastolica: 0,
      frequenciaCardiaca: 0,
      frequenciaRespiratoria: 0,
      saturacaoOxigenio: 0,
      temperatura: 0,
      peso: undefined,
      altura: undefined,
      observacoes: '',
    }
  })

  const watchedValues = watch()

  // Calcular IMC
  const imc = watchedValues.peso && watchedValues.altura
    ? Math.round((watchedValues.peso / Math.pow(watchedValues.altura / 100, 2)) * 100) / 100
    : null

  // Calcular PAM
  const pam = watchedValues.pressaoSistolica && watchedValues.pressaoDiastolica
    ? Math.round((watchedValues.pressaoDiastolica + (watchedValues.pressaoSistolica - watchedValues.pressaoDiastolica) / 3))
    : null

  const onSubmit = async (data: VitalsFormData) => {
    setIsSubmitting(true)
    try {
      if (vitals) {
        // Atualizar sinais vitais existentes
        await vitalsService.updateVital(patientId, {
          id: vitals.id,
          ...data
        })
        toast.success('Sinais vitais atualizados com sucesso!')
      } else {
        // Criar novos sinais vitais
        await vitalsService.createVital({
          patientId,
          ...data
        })
        toast.success('Sinais vitais registrados com sucesso!')
      }

      reset()
      onSuccess()
    } catch (error) {
      toast.error('Erro ao salvar sinais vitais')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Activity className="h-6 w-6 text-primary-600" />
            <h2 className="text-xl font-bold text-gray-900">
              {vitals ? 'Editar Sinais Vitais' : 'Novos Sinais Vitais'}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Pressão Arterial */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Pressão Arterial</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sistólica (mmHg)
                </label>
                <input
                  {...register('pressaoSistolica', { valueAsNumber: true })}
                  type="number"
                  placeholder="120"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    errors.pressaoSistolica ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.pressaoSistolica && (
                  <p className="mt-1 text-sm text-red-600">{errors.pressaoSistolica.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diastólica (mmHg)
                </label>
                <input
                  {...register('pressaoDiastolica', { valueAsNumber: true })}
                  type="number"
                  placeholder="80"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    errors.pressaoDiastolica ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.pressaoDiastolica && (
                  <p className="mt-1 text-sm text-red-600">{errors.pressaoDiastolica.message}</p>
                )}
              </div>

              {pam && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-800">
                    PAM: {pam} mmHg
                  </p>
                </div>
              )}
            </div>

            {/* Frequências */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Frequências</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequência Cardíaca (bpm)
                </label>
                <input
                  {...register('frequenciaCardiaca', { valueAsNumber: true })}
                  type="number"
                  placeholder="72"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    errors.frequenciaCardiaca ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.frequenciaCardiaca && (
                  <p className="mt-1 text-sm text-red-600">{errors.frequenciaCardiaca.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequência Respiratória (irpm)
                </label>
                <input
                  {...register('frequenciaRespiratoria', { valueAsNumber: true })}
                  type="number"
                  placeholder="16"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    errors.frequenciaRespiratoria ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.frequenciaRespiratoria && (
                  <p className="mt-1 text-sm text-red-600">{errors.frequenciaRespiratoria.message}</p>
                )}
              </div>
            </div>

            {/* Outros */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Outros</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Saturação O₂ (%)
                </label>
                <input
                  {...register('saturacaoOxigenio', { valueAsNumber: true })}
                  type="number"
                  placeholder="98"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    errors.saturacaoOxigenio ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.saturacaoOxigenio && (
                  <p className="mt-1 text-sm text-red-600">{errors.saturacaoOxigenio.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temperatura (°C)
                </label>
                <input
                  {...register('temperatura', { valueAsNumber: true })}
                  type="number"
                  step="0.1"
                  placeholder="36.5"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    errors.temperatura ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.temperatura && (
                  <p className="mt-1 text-sm text-red-600">{errors.temperatura.message}</p>
                )}
              </div>
            </div>

            {/* Peso e Altura */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Antropometria</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Peso (kg)
                </label>
                <input
                  {...register('peso', { valueAsNumber: true })}
                  type="number"
                  step="0.1"
                  placeholder="70"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    errors.peso ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.peso && (
                  <p className="mt-1 text-sm text-red-600">{errors.peso.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Altura (cm)
                </label>
                <input
                  {...register('altura', { valueAsNumber: true })}
                  type="number"
                  placeholder="170"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    errors.altura ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.altura && (
                  <p className="mt-1 text-sm text-red-600">{errors.altura.message}</p>
                )}
              </div>

              {imc && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">
                    IMC: {imc} kg/m²
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Observações */}
          <div className="mt-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              {...register('observacoes')}
              rows={3}
              placeholder="Observações adicionais sobre os sinais vitais..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
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
              <span>{isSubmitting ? 'Salvando...' : 'Salvar Sinais Vitais'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
