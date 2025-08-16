import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Plus,
  Activity,
  Pill,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit,
  AlertTriangle,
  Eye
} from 'lucide-react'
import { conditionsService, PatientCondition } from '../../services/conditions'
import { medicationsService, PatientMedication } from '../../services/medications'
import ConditionForm from '../../components/clinical/ConditionForm'
import MedicationForm from '../../components/clinical/MedicationForm'
import OccurrenceForm from '../../components/clinical/OccurrenceForm'
import { AllergyList } from '../../components/allergies/AllergyList'

interface ClinicalHistoryProps {
  patientId: string
}

type TabType = 'conditions' | 'medications' | 'allergies'

export default function ClinicalHistory({ patientId }: ClinicalHistoryProps) {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<TabType>('conditions')
  const [showConditionForm, setShowConditionForm] = useState(false)
  const [showMedicationForm, setShowMedicationForm] = useState(false)
  const [showOccurrenceForm, setShowOccurrenceForm] = useState(false)
  const [editingCondition, setEditingCondition] = useState<PatientCondition | null>(null)
  const [editingMedication, setEditingMedication] = useState<PatientMedication | null>(null)
  const [selectedCondition, setSelectedCondition] = useState<PatientCondition | null>(null)
  const [conditionFormType, setConditionFormType] = useState<'PRE_EXISTING' | 'DIAGNOSED' | null>(null)

  // Queries
  const { data: conditions = [], isLoading: loadingConditions } = useQuery({
    queryKey: ['patient-conditions', patientId],
    queryFn: () => conditionsService.getPatientConditions(patientId)
  })

  const { data: medications = [], isLoading: loadingMedications } = useQuery({
    queryKey: ['patient-medications', patientId],
    queryFn: () => medicationsService.getPatientMedications(patientId)
  })

  // Handlers
  const handleConditionSuccess = () => {
    setShowConditionForm(false)
    setEditingCondition(null)
    setConditionFormType(null)
    queryClient.invalidateQueries({ queryKey: ['patient-conditions', patientId] })
  }

  const handleMedicationSuccess = () => {
    setShowMedicationForm(false)
    setEditingMedication(null)
    queryClient.invalidateQueries({ queryKey: ['patient-medications', patientId] })
  }

  const handleOccurrenceSuccess = () => {
    setShowOccurrenceForm(false)
    setSelectedCondition(null)
    queryClient.invalidateQueries({ queryKey: ['patient-conditions', patientId] })
  }

  const handleEditCondition = (condition: PatientCondition) => {
    setEditingCondition(condition)
    setConditionFormType(condition.source as 'PRE_EXISTING' | 'DIAGNOSED')
    setShowConditionForm(true)
  }

  const handleEditMedication = (medication: PatientMedication) => {
    setEditingMedication(medication)
    setShowMedicationForm(true)
  }

  const handleAddOccurrence = (condition: PatientCondition) => {
    setSelectedCondition(condition)
    setShowOccurrenceForm(true)
  }

  const handleResolveCondition = async (condition: PatientCondition) => {
    try {
      // Se há episódios, usar a data do último episódio como data de resolução
      let resolutionDate = new Date().toLocaleDateString('en-CA')
      
      if (condition.occurrences.length > 0) {
        // Pegar o último episódio (mais recente)
        const lastOccurrence = condition.occurrences[0] // Já ordenado por startAt desc
        if (lastOccurrence.endAt) {
          // Se o episódio tem data de fim, usar ela
          resolutionDate = new Date(lastOccurrence.endAt).toLocaleDateString('en-CA')
        } else {
          // Se não tem data de fim, usar a data de início do episódio
          resolutionDate = new Date(lastOccurrence.startAt).toLocaleDateString('en-CA')
        }
      }

      const updateData = {
        status: 'RESOLVED' as const,
        resolutionDate
      };
      
      await conditionsService.updatePatientCondition(patientId, condition.id, updateData);
      
      toast.success('Condição marcada como curada!')
      queryClient.invalidateQueries({ queryKey: ['patient-conditions', patientId] })
    } catch (error) {
      console.error('Erro ao marcar condição como curada:', error);
      toast.error('Erro ao marcar condição como curada')
    }
  }

  const handleEndMedication = async (medicationId: string) => {
    try {
      await medicationsService.updateMedication(patientId, medicationId, {
        active: false,
        endDate: new Date().toISOString()
      })
      toast.success('Medicamento encerrado com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['patient-medications', patientId] })
    } catch (error) {
      toast.error('Erro ao encerrar medicamento')
      console.error(error)
    }
  }

  const handleViewCondition = (condition: PatientCondition) => {
    setEditingCondition(condition)
    setShowConditionForm(true)
  }

  // Utility functions
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Activity className="h-4 w-4 text-red-500" />
      case 'REMISSION':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'RESOLVED':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'RULED_OUT':
        return <XCircle className="h-4 w-4 text-gray-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Ativa'
      case 'REMISSION':
        return 'Remissão'
      case 'RESOLVED':
        return 'Curada'
      case 'RULED_OUT':
        return 'Descartada'
      default:
        return status
    }
  }



  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('pt-BR')
  }



  // Filter conditions by source
  const preExistingConditions = conditions.filter(c => c.source === 'PRE_EXISTING')
  const diagnosedConditions = conditions.filter(c => c.source === 'DIAGNOSED')
  const activeMedications = medications.filter(m => m.active)
  const inactiveMedications = medications.filter(m => !m.active)

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('conditions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'conditions'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="h-4 w-4 inline mr-2" />
            Condições ({conditions.length})
          </button>
          <button
            onClick={() => setActiveTab('medications')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'medications'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Pill className="h-4 w-4 inline mr-2" />
            Medicamentos ({medications.length})
          </button>
          <button
            onClick={() => setActiveTab('allergies')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'allergies'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <AlertTriangle className="h-4 w-4 inline mr-2" />
            Alergias
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'conditions' && (
        <div className="space-y-8">
          {/* Comorbidades Pré-existentes */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Condições Pré-existentes</h3>
                             <button
                 onClick={() => {
                   setEditingCondition(null)
                   setConditionFormType('PRE_EXISTING')
                   setShowConditionForm(true)
                 }}
                 className="btn btn-primary flex items-center"
               >
                 <Plus className="h-4 w-4 mr-2" />
                 Adicionar Condição
               </button>
            </div>

            {loadingConditions ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Carregando condições...</p>
              </div>
            ) : preExistingConditions.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma comorbidade pré-existente</h3>
                <p className="text-gray-500 mb-4">Adicione as condições que o paciente já possuía.</p>
                                 <button
                   onClick={() => {
                     setEditingCondition(null)
                     setConditionFormType('PRE_EXISTING')
                     setShowConditionForm(true)
                   }}
                   className="btn btn-primary"
                 >
                   Adicionar Primeira Comorbidade
                 </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {preExistingConditions.map((condition) => (
                  <div
                    key={condition.id}
                    className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-lg font-semibold text-gray-900">{condition.condition.name}</h4>
                          {condition.appointmentId && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Atendimento Finalizado
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{condition.condition.icd10}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          {getStatusIcon(condition.status)}
                          <span className="text-sm text-gray-600">{getStatusLabel(condition.status)}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {/* Só mostrar botão de editar se não estiver travada E não estiver curada */}
                        {!condition.locked && condition.status !== 'RESOLVED' ? (
                          <button
                            onClick={() => handleEditCondition(condition)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="Editar condição"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            disabled
                            className="text-gray-400 cursor-not-allowed"
                            title={condition.locked ? "Condição de atendimento finalizado - não pode ser editada" : "Condição curada - não pode ser editada"}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleViewCondition(condition)}
                          className="text-gray-600 hover:text-gray-800 transition-colors"
                          title="Visualizar condição"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {condition.isChronic && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          Crônica
                        </span>
                      )}
                      {condition.isTreatable && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Tratável
                        </span>
                      )}
                    </div>

                    {/* Dates */}
                    <div className="space-y-1 text-sm text-gray-600">
                      {condition.onsetDate && (
                        <p>Início: {formatDate(condition.onsetDate)}</p>
                      )}
                      {condition.resolutionDate && (
                        <p>Resolução: {formatDate(condition.resolutionDate)}</p>
                      )}
                    </div>

                    {/* Notes */}
                    {condition.notes && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-700">{condition.notes}</p>
                      </div>
                    )}

                    {/* Occurrences */}
                    {condition.occurrences.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h5 className="text-sm font-medium text-gray-900 mb-2">Episódios ({condition.occurrences.length})</h5>
                        <div className="space-y-3 max-h-40 overflow-y-auto">
                          {condition.occurrences
                            .sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime()) // Ordenar por data de início (mais recente primeiro)
                            .map((occurrence, index) => (
                            <div key={occurrence.id} className="bg-gray-50 rounded-lg p-3 border-l-4 border-blue-500">
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-semibold text-blue-600">
                                  Episódio {condition.occurrences.length - index}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatDate(occurrence.startAt)}
                                </span>
                              </div>
                              <div className="text-xs text-gray-700 space-y-1">
                                <div>
                                  <span className="font-medium text-gray-800">Início:</span> {formatDate(occurrence.startAt)}
                                </div>
                                {occurrence.endAt && (
                                  <div>
                                    <span className="font-medium text-gray-800">Fim:</span> {formatDate(occurrence.endAt)}
                                  </div>
                                )}
                              </div>
                              {occurrence.notes && (
                                <div className="text-xs text-gray-600 mt-2 italic">
                                  "{occurrence.notes}"
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        {condition.occurrences.length > 3 && (
                          <div className="mt-2 text-xs text-gray-500 text-center">
                            Total de {condition.occurrences.length} episódios registrados
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    {condition.status === 'ACTIVE' && !condition.isChronic && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => handleResolveCondition(condition)}
                          className="w-full btn btn-secondary text-sm"
                        >
                          Marcar como Curada
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Doenças Diagnosticadas */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Doenças Diagnosticadas</h3>
                             <button
                 onClick={() => {
                   setEditingCondition(null)
                   setConditionFormType('DIAGNOSED')
                   setShowConditionForm(true)
                 }}
                 className="btn btn-primary flex items-center"
               >
                 <Plus className="h-4 w-4 mr-2" />
                 Adicionar Diagnóstico
               </button>
            </div>

            {diagnosedConditions.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma doença diagnosticada</h3>
                <p className="text-gray-500 mb-4">Adicione os diagnósticos realizados durante o atendimento.</p>
                                 <button
                   onClick={() => {
                     setEditingCondition(null)
                     setConditionFormType('DIAGNOSED')
                     setShowConditionForm(true)
                   }}
                   className="btn btn-primary"
                 >
                   Adicionar Primeiro Diagnóstico
                 </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {diagnosedConditions.map((condition) => (
                  <div
                    key={condition.id}
                    className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-lg font-semibold text-gray-900">{condition.condition.name}</h4>
                          {condition.appointmentId && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Atendimento Finalizado
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{condition.condition.icd10}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          {getStatusIcon(condition.status)}
                          <span className="text-sm text-gray-600">{getStatusLabel(condition.status)}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {/* Só mostrar botão de editar se não estiver travada E não estiver curada */}
                        {!condition.locked && condition.status !== 'RESOLVED' ? (
                          <button
                            onClick={() => handleEditCondition(condition)}
                            className="text-primary-600 hover:text-primary-900 p-1 rounded transition-colors"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            disabled
                            className="text-gray-400 p-1 rounded cursor-not-allowed"
                            title={
                              condition.locked 
                                ? "Condição de atendimento finalizado - não pode ser editado"
                                : "Condição curada - não pode ser editado"
                            }
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                        {condition.condition.flags.allowRecurrence && (
                          <button
                            onClick={() => handleAddOccurrence(condition)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                            title="Novo episódio"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {condition.isChronic && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          Crônica
                        </span>
                      )}
                      {condition.isTreatable && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Tratável
                        </span>
                      )}
                    </div>

                    {/* Dates */}
                    <div className="space-y-1 text-sm text-gray-600">
                      {condition.onsetDate && (
                        <p>Início: {formatDate(condition.onsetDate)}</p>
                      )}
                      {condition.resolutionDate && (
                        <p>Resolução: {formatDate(condition.resolutionDate)}</p>
                      )}
                    </div>

                    {/* Notes */}
                    {condition.notes && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-700">{condition.notes}</p>
                      </div>
                    )}

                    {/* Occurrences */}
                    {condition.occurrences.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h5 className="text-sm font-medium text-gray-900 mb-2">Episódios ({condition.occurrences.length})</h5>
                        <div className="space-y-3 max-h-40 overflow-y-auto">
                          {condition.occurrences
                            .sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime()) // Ordenar por data de início (mais recente primeiro)
                            .map((occurrence, index) => (
                            <div key={occurrence.id} className="bg-gray-50 rounded-lg p-3 border-l-4 border-blue-500">
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-semibold text-blue-600">
                                  Episódio {condition.occurrences.length - index}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatDate(occurrence.startAt)}
                                </span>
                              </div>
                              <div className="text-xs text-gray-700 space-y-1">
                                <div>
                                  <span className="font-medium text-gray-800">Início:</span> {formatDate(occurrence.startAt)}
                                </div>
                                {occurrence.endAt && (
                                  <div>
                                    <span className="font-medium text-gray-800">Fim:</span> {formatDate(occurrence.endAt)}
                                  </div>
                                )}
                              </div>
                              {occurrence.notes && (
                                <div className="text-xs text-gray-600 mt-2 italic">
                                  "{occurrence.notes}"
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        {condition.occurrences.length > 3 && (
                          <div className="mt-2 text-xs text-gray-500 text-center">
                            Total de {condition.occurrences.length} episódios registrados
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    {condition.status === 'ACTIVE' && !condition.isChronic && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => handleResolveCondition(condition)}
                          className="w-full btn btn-secondary text-sm"
                        >
                          Marcar como Curada
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'medications' && (
        <div className="space-y-6">
          {/* Medicamentos Ativos */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Medicamentos de Uso Contínuo</h3>
              <button
                onClick={() => setShowMedicationForm(true)}
                className="btn btn-primary flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Medicamento
              </button>
            </div>

            {loadingMedications ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Carregando medicamentos...</p>
              </div>
            ) : activeMedications.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8 text-center">
                <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum medicamento ativo</h3>
                <p className="text-gray-500 mb-4">Adicione os medicamentos de uso contínuo do paciente.</p>
                <button
                  onClick={() => setShowMedicationForm(true)}
                  className="btn btn-primary"
                >
                  Adicionar Primeiro Medicamento
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeMedications.map((medication) => (
                  <div
                    key={medication.id}
                    className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900">{medication.name}</h4>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Ativo
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditMedication(medication)}
                          className="text-primary-600 hover:text-primary-900 p-1 rounded"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Medication details */}
                    <div className="space-y-2 text-sm text-gray-600">
                      {medication.dose && (
                        <p><span className="font-medium">Dose:</span> {medication.dose}</p>
                      )}
                      {medication.frequency && (
                        <p><span className="font-medium">Frequência:</span> {medication.frequency}</p>
                      )}
                      {medication.route && (
                        <p><span className="font-medium">Via:</span> {medication.route}</p>
                      )}
                      {medication.startDate && (
                        <p><span className="font-medium">Início:</span> {formatDate(medication.startDate)}</p>
                      )}
                    </div>

                    {/* Notes */}
                    {medication.notes && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-700">{medication.notes}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleEndMedication(medication.id)}
                        className="w-full btn btn-secondary text-sm"
                      >
                        Encerrar Medicamento
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Medicamentos Inativos */}
          {inactiveMedications.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Histórico de Medicamentos</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inactiveMedications.map((medication) => (
                  <div
                    key={medication.id}
                    className="bg-gray-50/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/20 p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-700">{medication.name}</h4>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Encerrado
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Medication details */}
                    <div className="space-y-2 text-sm text-gray-600">
                      {medication.dose && (
                        <p><span className="font-medium">Dose:</span> {medication.dose}</p>
                      )}
                      {medication.frequency && (
                        <p><span className="font-medium">Frequência:</span> {medication.frequency}</p>
                      )}
                      {medication.route && (
                        <p><span className="font-medium">Via:</span> {medication.route}</p>
                      )}
                      {medication.startDate && (
                        <p><span className="font-medium">Início:</span> {formatDate(medication.startDate)}</p>
                      )}
                      {medication.endDate && (
                        <p><span className="font-medium">Fim:</span> {formatDate(medication.endDate)}</p>
                      )}
                    </div>

                    {/* Notes */}
                    {medication.notes && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-700">{medication.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Alergias Tab */}
      {activeTab === 'allergies' && (
        <div className="space-y-6">
          <AllergyList patientId={patientId} />
        </div>
      )}

      {/* Forms */}
             {showConditionForm && (
         <ConditionForm
           patientId={patientId}
           onSuccess={handleConditionSuccess}
           onCancel={() => {
             setShowConditionForm(false)
             setEditingCondition(null)
             setConditionFormType(null)
           }}
           condition={editingCondition}
           defaultSource={conditionFormType}
         />
       )}

      {showMedicationForm && (
        <MedicationForm
          patientId={patientId}
          onSuccess={handleMedicationSuccess}
          onCancel={() => {
            setShowMedicationForm(false)
            setEditingMedication(null)
          }}
          medication={editingMedication}
        />
      )}

      {showOccurrenceForm && selectedCondition && (
        <OccurrenceForm
          patientId={patientId}
          conditionId={selectedCondition.id}
          onSuccess={handleOccurrenceSuccess}
          onCancel={() => {
            setShowOccurrenceForm(false)
            setSelectedCondition(null)
          }}
        />
      )}
    </div>
  )
}
