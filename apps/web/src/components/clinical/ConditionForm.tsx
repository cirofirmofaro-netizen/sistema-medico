import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { X, Search, Calendar } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { conditionsService, Condition, PatientCondition, CreatePatientConditionData, UpdatePatientConditionData } from '../../services/conditions'
import { atendimentosService } from '../../services/atendimentos'

const conditionFormSchema = z.object({
  conditionId: z.string().min(1, 'Condição é obrigatória'),
  source: z.enum(['PRE_EXISTING', 'DIAGNOSED', 'SELF_REPORTED']),
  status: z.enum(['ACTIVE', 'REMISSION', 'RESOLVED', 'RULED_OUT']),
  onsetDate: z.string().optional(),
  resolutionDate: z.string().optional(),
  chronicOverride: z.boolean().optional(),
  treatableOverride: z.boolean().optional(),
  severity: z.string().optional(),
  notes: z.string().optional(),
  appointmentId: z.string().optional(),
}).refine((data) => {
  if (data.onsetDate && data.resolutionDate) {
    return new Date(data.onsetDate) <= new Date(data.resolutionDate)
  }
  return true
}, {
  message: 'Data de resolução deve ser posterior à data de início',
  path: ['resolutionDate']
})

type ConditionFormData = z.infer<typeof conditionFormSchema>

interface ConditionFormProps {
  patientId: string
  onSuccess: () => void
  onCancel: () => void
  condition?: PatientCondition | null
  defaultSource?: 'PRE_EXISTING' | 'DIAGNOSED' | null
}

export default function ConditionForm({ patientId, onSuccess, onCancel, condition, defaultSource }: ConditionFormProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [selectedCondition, setSelectedCondition] = useState<Condition | null>(null)

  // Buscar atendimento ativo para vincular condições diagnosticadas
  const { data: atendimentos = [] } = useQuery({
    queryKey: ['atendimentos', patientId],
    queryFn: () => atendimentosService.listPatientAtendimentos(patientId),
    enabled: !!patientId
  })

  // Encontrar atendimento ativo (em andamento)
  const atendimentoAtivo = atendimentos.find(a => a.status === 'EM_ANDAMENTO')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<ConditionFormData>({
    resolver: zodResolver(conditionFormSchema),
    defaultValues: {
      source: condition ? condition.source : (defaultSource || 'DIAGNOSED'),
      status: 'ACTIVE',
      // Usar data atual correta considerando timezone local
      onsetDate: condition ? condition.onsetDate?.split('T')[0] : new Date().toLocaleDateString('en-CA'),
      // NÃO preencher resolutionDate automaticamente para novas condições
      ...(condition && {
        conditionId: condition.conditionId,
        source: condition.source, // Manter o source original quando editando
        status: condition.status,
        onsetDate: condition.onsetDate?.split('T')[0],
        resolutionDate: condition.resolutionDate?.split('T')[0],
        chronicOverride: condition.chronicOverride,
        treatableOverride: condition.treatableOverride,
        severity: condition.severity,
        notes: condition.notes
      })
    }
  })

  // Search conditions
  const { data: searchResults = [], isLoading: searching } = useQuery({
    queryKey: ['search-conditions', searchQuery],
    queryFn: () => conditionsService.searchConditions(searchQuery),
    enabled: searchQuery.length >= 2,
    staleTime: 5 * 60 * 1000 // 5 minutes
  })

  // Watch form values (if needed for future use)

  // Set selected condition when editing
  useEffect(() => {
    if (condition) {
      setSelectedCondition(condition.condition)
    }
  }, [condition])

  // Handle condition selection
  const handleConditionSelect = (selected: Condition) => {
    setSelectedCondition(selected)
    setValue('conditionId', selected.id)
    setSearchQuery(selected.name)
    setShowSearchResults(false)

    // NÃO auto-sugerir data de resolução para condições não crônicas
    // Remover esta lógica que estava preenchendo automaticamente
  }

  const onSubmit = async (data: ConditionFormData) => {
    try {
      // Preparar dados para envio
      const submitData = { ...data }
      
      // Se for uma condição diagnosticada e há atendimento ativo, vincular
      if (data.source === 'DIAGNOSED' && atendimentoAtivo && !condition) {
        submitData.appointmentId = atendimentoAtivo.id
      }

      if (condition && condition.id) {
        // Update existing condition
        await conditionsService.updatePatientCondition(patientId, condition.id, submitData as UpdatePatientConditionData)
        toast.success('Condição atualizada com sucesso!')
      } else {
        // Create new condition
        await conditionsService.createPatientCondition(patientId, submitData as CreatePatientConditionData)
        toast.success('Condição adicionada com sucesso!')
      }
      onSuccess()
    } catch (error) {
      toast.error('Erro ao salvar condição')
      console.error(error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {condition ? 'Editar Condição' : 'Adicionar Condição'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Condition Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Condição *
            </label>
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setShowSearchResults(true)
                    if (e.target.value.length < 2) {
                      setShowSearchResults(false)
                    }
                  }}
                  onFocus={() => setShowSearchResults(true)}
                  placeholder="Digite para buscar condições (ex: AR, MS, HAS...)"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Search Results */}
              {showSearchResults && searchQuery.length >= 2 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {searching ? (
                    <div className="p-4 text-center text-gray-500">
                      Buscando condições...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="py-1">
                      {searchResults.map((result) => (
                        <button
                          key={result.id}
                          type="button"
                          onClick={() => handleConditionSelect(result)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900">{result.name}</p>
                              {result.icd10 && (
                                <p className="text-sm text-gray-500">ICD-10: {result.icd10}</p>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {result.flags.chronicDefault && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                  Crônica
                                </span>
                              )}
                              {result.flags.treatableDefault && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Tratável
                                </span>
                              )}
                            </div>
                          </div>
                          {result.synonyms.length > 0 && (
                            <p className="text-xs text-gray-400 mt-1">
                              Sinônimos: {result.synonyms.join(', ')}
                            </p>
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      Nenhuma condição encontrada
                    </div>
                  )}
                </div>
              )}
            </div>
            <input type="hidden" {...register('conditionId')} />
            {errors.conditionId && (
              <p className="mt-1 text-sm text-red-600">{errors.conditionId.message}</p>
            )}
          </div>

          {/* Selected Condition Info */}
          {selectedCondition && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">{selectedCondition.name}</h4>
              <div className="flex flex-wrap gap-2">
                {selectedCondition.flags.chronicDefault && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    Crônica
                  </span>
                )}
                {selectedCondition.flags.treatableDefault && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Tratável
                  </span>
                )}
                {selectedCondition.flags.allowRecurrence && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Recorrente
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Source */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Origem *
            </label>
            <select
              {...register('source')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="PRE_EXISTING">Pré-existente</option>
              <option value="DIAGNOSED">Diagnosticada</option>
              <option value="SELF_REPORTED">Auto-relatada</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              {...register('status')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="ACTIVE">Ativa</option>
              <option value="REMISSION">Remissão</option>
              <option value="RESOLVED">Resolvida</option>
              <option value="RULED_OUT">Descartada</option>
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
                  {...register('onsetDate')}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Resolução
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  {...register('resolutionDate')}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              {errors.resolutionDate && (
                <p className="mt-1 text-sm text-red-600">{errors.resolutionDate.message}</p>
              )}
            </div>
          </div>

          {/* Overrides */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('chronicOverride')}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Crônica (sobrescrever padrão)</span>
              </label>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('treatableOverride')}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Tratável (sobrescrever padrão)</span>
              </label>
            </div>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Severidade
            </label>
            <select
              {...register('severity')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Selecionar severidade</option>
              <option value="LEVE">Leve</option>
              <option value="MODERADA">Moderada</option>
              <option value="GRAVE">Grave</option>
            </select>
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
              placeholder="Observações adicionais sobre a condição..."
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
              {isSubmitting ? 'Salvando...' : condition ? 'Atualizar' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
