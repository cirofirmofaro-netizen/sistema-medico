import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { X, Calendar } from 'lucide-react'
import { medicationsService, PatientMedication, CreateMedicationData, UpdateMedicationData } from '../../services/medications'

const medicationFormSchema = z.object({
  name: z.string().min(1, 'Nome do medicamento é obrigatório'),
  dose: z.string().optional(),
  frequency: z.string().optional(),
  customFrequency: z.string().optional(),
  route: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  notes: z.string().optional(),
  active: z.boolean(),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) <= new Date(data.endDate)
  }
  return true
}, {
  message: 'Data de fim deve ser posterior à data de início',
  path: ['endDate']
})

type MedicationFormData = z.infer<typeof medicationFormSchema>

interface MedicationFormProps {
  patientId: string
  onSuccess: () => void
  onCancel: () => void
  medication?: PatientMedication | null
}

const ROUTES = [
  { value: 'VO', label: 'Oral (VO)' },
  { value: 'SC', label: 'Subcutânea (SC)' },
  { value: 'IM', label: 'Intramuscular (IM)' },
  { value: 'IV', label: 'Intravenosa (IV)' },
  { value: 'TOP', label: 'Tópica (TOP)' },
  { value: 'INH', label: 'Inalatória (INH)' },
  { value: 'RET', label: 'Retal (RET)' },
  { value: 'VAG', label: 'Vaginal (VAG)' },
]

const FREQUENCIES = [
  { value: '1x/dia', label: '1x ao dia' },
  { value: '2x/dia', label: '2x ao dia' },
  { value: '3x/dia', label: '3x ao dia' },
  { value: '4x/dia', label: '4x ao dia' },
  { value: '6x/dia', label: '6x ao dia' },
  { value: '8x/dia', label: '8x ao dia' },
  { value: '12x/dia', label: '12x ao dia' },
  { value: '1x/semana', label: '1x por semana' },
  { value: '2x/semana', label: '2x por semana' },
  { value: '3x/semana', label: '3x por semana' },
  { value: '1x/mês', label: '1x por mês' },
  { value: 'SOS', label: 'SOS (quando necessário)' },
  { value: 'CONTINUO', label: 'Contínuo' },
  { value: 'OUTROS', label: 'Outros (especificar)' },
]

export default function MedicationForm({ patientId, onSuccess, onCancel, medication }: MedicationFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<MedicationFormData>({
    resolver: zodResolver(medicationFormSchema),
    defaultValues: {
      active: true,
      ...(medication && {
        name: medication.name,
        dose: medication.dose,
        frequency: medication.frequency,
        route: medication.route,
        startDate: medication.startDate?.split('T')[0],
        endDate: medication.endDate?.split('T')[0],
        notes: medication.notes,
        active: medication.active
      })
    }
  })

  const watchedActive = watch('active')

  const onSubmit = async (data: MedicationFormData) => {
    try {
      // Se a frequência for "OUTROS", usar o valor do campo de texto personalizado
      const submitData = { ...data }
      if (data.frequency === 'OUTROS') {
        // Usar o valor do campo de texto personalizado
        submitData.frequency = data.customFrequency || 'Outros'
      }

      if (medication) {
        // Update existing medication
        await medicationsService.updateMedication(patientId, medication.id, submitData as UpdateMedicationData)
        toast.success('Medicamento atualizado com sucesso!')
      } else {
        // Create new medication
        await medicationsService.createMedication(patientId, submitData as CreateMedicationData)
        toast.success('Medicamento adicionado com sucesso!')
      }
      onSuccess()
    } catch (error) {
      toast.error('Erro ao salvar medicamento')
      console.error(error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {medication ? 'Editar Medicamento' : 'Adicionar Medicamento'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Medicamento *
            </label>
            <input
              type="text"
              {...register('name')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Ex: Losartana, Metformina, AAS..."
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Dose and Frequency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dose
              </label>
              <input
                type="text"
                {...register('dose')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ex: 50 mg, 500 mg, 1 comprimido..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frequência
              </label>
              <select
                {...register('frequency')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Selecionar frequência</option>
                {FREQUENCIES.map((freq) => (
                  <option key={freq.value} value={freq.value}>
                    {freq.label}
                  </option>
                ))}
              </select>
              {watch('frequency') === 'OUTROS' && (
                <input
                  type="text"
                  {...register('customFrequency')}
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Especificar frequência (ex: 1x a cada 8h, 2x por semana, etc.)"
                  defaultValue=""
                />
              )}
            </div>
          </div>

          {/* Route */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Via de Administração
            </label>
            <select
              {...register('route')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Selecionar via</option>
              {ROUTES.map((route) => (
                <option key={route.value} value={route.value}>
                  {route.label}
                </option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Início
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  {...register('startDate')}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Fim
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  {...register('endDate')}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          {/* Active Status */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('active')}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">Medicamento ativo</span>
            </label>
            {!watchedActive && (
              <p className="mt-1 text-sm text-gray-500">
                Desmarque para encerrar o medicamento
              </p>
            )}
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
              placeholder="Observações sobre o medicamento, horários específicos, etc..."
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
              {isSubmitting ? 'Salvando...' : medication ? 'Atualizar' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
