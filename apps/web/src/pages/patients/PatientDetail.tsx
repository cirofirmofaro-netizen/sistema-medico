import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Edit,
  Calendar,
  Phone,
  Mail,
  MapPin,
  User,
  FileText,
  Activity,
  Paperclip,
  Plus,
  Trash2,
  Download,
  Heart,
  X,
  Eye,
  AlertTriangle
} from 'lucide-react'
import { patientsService } from '../../services/patients'
import { evolutionsService, vitalsService, filesService } from '../../services/medicalRecords'
import { Evolution, VitalSigns } from '../../types'
import { atendimentosService } from '../../services/atendimentos'
import { conditionsService } from '../../services/conditions'
import { medicationsService } from '../../services/medications'
import { allergiesService } from '../../services/allergies'
import EvolutionForm from '../../components/prontuario/EvolutionForm'
import VitalsForm from '../../components/prontuario/VitalsForm'
import ClinicalHistory from './ClinicalHistory'
import { AtendimentosDoDia } from '../../components/atendimentos/AtendimentosDoDia'
import { AllergyAlertBanner } from '../../components/allergies/AllergyAlertBanner'
import { SimpleAnexoUploader } from '../../components/SimpleAnexoUploader'
import api from '../../lib/api'

type TabType = 'info' | 'evolutions' | 'vitals' | 'files' | 'clinical' | 'atendimentos'

export function PatientDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<TabType>('info')
  const [showEvolutionForm, setShowEvolutionForm] = useState(false)
  const [showVitalsForm, setShowVitalsForm] = useState(false)
  const [showFileUploadForm, setShowFileUploadForm] = useState(false)
  const [editingEvolution, setEditingEvolution] = useState<Evolution | null>(null)
  const [editingVitals, setEditingVitals] = useState<VitalSigns | null>(null)
  const [viewingEvolution, setViewingEvolution] = useState<Evolution | null>(null)
  const [viewingVitals, setViewingVitals] = useState<VitalSigns | null>(null)

  // Query para buscar dados do paciente
  const { data: patient, isLoading, error } = useQuery({
    queryKey: ['patient', id],
    queryFn: () => patientsService.getPatient(id!),
    enabled: !!id
  })

  // Query para evoluções
  const { data: evolutions = [], isLoading: loadingEvolutions } = useQuery({
    queryKey: ['patient-evolutions', id],
    queryFn: () => evolutionsService.listEvolutions(id!),
    enabled: !!id
  })

  // Query para sinais vitais
  const { data: vitals = [] } = useQuery({
    queryKey: ['patient-vitals', id],
    queryFn: () => vitalsService.listVitals(id!),
    enabled: !!id
  })

  // Query para arquivos
  const { data: files = [] } = useQuery({
    queryKey: ['patient-files', id],
    queryFn: () => filesService.listFiles(id!),
    enabled: !!id
  })

  // Query para atendimentos
  const { data: atendimentos = [], isLoading: loadingAtendimentos } = useQuery({
    queryKey: ['patient-atendimentos', id],
    queryFn: () => atendimentosService.listPatientAtendimentos(id!),
    enabled: !!id
  })

  // Query para condições do paciente
  const { data: conditions = [], isLoading: loadingConditions } = useQuery({
    queryKey: ['patient-conditions', id],
    queryFn: () => conditionsService.getPatientConditions(id!),
    enabled: !!id
  })

  // Query para medicamentos do paciente
  const { data: medications = [], isLoading: loadingMedications } = useQuery({
    queryKey: ['patient-medications', id],
    queryFn: () => medicationsService.getPatientMedications(id!),
    enabled: !!id
  })

  // Query para alergias do paciente
  const { data: allergies = [], isLoading: loadingAllergies } = useQuery({
    queryKey: ['patient-allergies', id],
    queryFn: () => allergiesService.getPatientAllergies(id!),
    enabled: !!id
  })

  // Funções de callback para atualizar dados
  const handleEvolutionSuccess = () => {
    setShowEvolutionForm(false)
    setEditingEvolution(null)
    queryClient.invalidateQueries({ queryKey: ['patient-evolutions', id] })
  }

  const handleVitalsSuccess = () => {
    setShowVitalsForm(false)
    setEditingVitals(null)
    queryClient.invalidateQueries({ queryKey: ['patient-vitals', id] })
  }

  const handleFileUploadSuccess = () => {
    setShowFileUploadForm(false)
    queryClient.invalidateQueries({ queryKey: ['patient-files', id] })
  }

  const handleEditEvolution = (evolution: Evolution) => {
    setEditingEvolution(evolution)
    setShowEvolutionForm(true)
  }

  const handleViewEvolution = (evolution: Evolution) => {
    setViewingEvolution(evolution)
  }

  const handleEditVitals = (vitals: VitalSigns) => {
    setEditingVitals(vitals)
    setShowVitalsForm(true)
  }

  const handleViewVitals = (vitals: VitalSigns) => {
    setViewingVitals(vitals)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }



  const formatGender = (gender: string | null) => {
    if (!gender) return 'N/A'
    return gender === 'M' ? 'Masculino' : gender === 'F' ? 'Feminino' : gender
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }

  const getCategoryLabel = (category: string) => {
    const labels = {
      DRUG: 'Medicamento',
      FOOD: 'Alimento',
      ENVIRONMENT: 'Ambiente',
      CONTACT: 'Contato',
      OTHER: 'Outro',
    };
    return labels[category as keyof typeof labels] || category;
  };

  // Verificar se há atendimentos em aberto
  // Pode criar novos registros apenas quando NÃO há atendimentos em andamento
  const hasOpenAtendimentos = atendimentos.some(atendimento => atendimento.status === 'EM_ANDAMENTO')
  const canCreateEvolution = !hasOpenAtendimentos

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Carregando paciente...</p>
        </div>
      </div>
    )
  }

  if (error || !patient) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Erro ao carregar paciente</p>
        <button
          onClick={() => navigate('/patients')}
          className="btn btn-primary mt-4"
        >
          Voltar para lista
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/patients')}
            className="btn btn-secondary flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{patient.nome}</h1>
            <p className="text-gray-600">Detalhes do paciente</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate(`/patients/${patient.id}/edit`)}
            className="btn btn-primary flex items-center"
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </button>
          <button
            onClick={() => navigate(`/appointments/new?patientId=${patient.id}`)}
            className="btn btn-secondary flex items-center"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Agendar Consulta
          </button>
                 </div>
       </div>

       {/* Alergia Alert Banner */}
       <AllergyAlertBanner patientId={patient.id} />

       {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'info'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <User className="h-4 w-4 inline mr-2" />
            Informações
          </button>
          <button
            onClick={() => setActiveTab('evolutions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'evolutions'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="h-4 w-4 inline mr-2" />
            Evoluções ({evolutions.length})
          </button>
          <button
            onClick={() => setActiveTab('vitals')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'vitals'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Activity className="h-4 w-4 inline mr-2" />
            Sinais Vitais ({vitals.length})
          </button>
                     <button
             onClick={() => setActiveTab('files')}
             className={`py-2 px-1 border-b-2 font-medium text-sm ${
               activeTab === 'files'
                 ? 'border-primary-500 text-primary-600'
                 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
             }`}
           >
             <Paperclip className="h-4 w-4 inline mr-2" />
             Anexos ({files.length})
           </button>
           <button
             onClick={() => setActiveTab('clinical')}
             className={`py-2 px-1 border-b-2 font-medium text-sm ${
               activeTab === 'clinical'
                 ? 'border-primary-500 text-primary-600'
                 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
             }`}
           >
             <Heart className="h-4 w-4 inline mr-2" />
             Histórico Clínico
           </button>
           <button
             onClick={() => setActiveTab('atendimentos')}
             className={`py-2 px-1 border-b-2 font-medium text-sm ${
               activeTab === 'atendimentos'
                 ? 'border-primary-500 text-primary-600'
                 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
             }`}
           >
             <Calendar className="h-4 w-4 inline mr-2" />
             Atendimentos do Dia
           </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'info' && (
          <div className="space-y-6">
            {/* Dados Pessoais */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados Pessoais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nome Completo</label>
                    <p className="text-sm text-gray-900">{patient.nome}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Data de Nascimento</label>
                    <p className="text-sm text-gray-900 flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {patient.dataNascimento ? formatDate(patient.dataNascimento) : 'Data de nascimento não informada'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Sexo</label>
                    <p className="text-sm text-gray-900">{formatGender(patient.sexo)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">CPF</label>
                    <p className="text-sm text-gray-900">{patient.cpf || 'N/A'}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Telefone</label>
                    <p className="text-sm text-gray-900 flex items-center">
                      <Phone className="h-3 w-3 mr-1" />
                      {patient.telefone || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-sm text-gray-900 flex items-center">
                      <Mail className="h-3 w-3 mr-1" />
                      {patient.email || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Endereço</label>
                    <p className="text-sm text-gray-900 flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {patient.endereco || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {patient.observacoes && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Observações</h4>
                  <p className="text-sm text-gray-700">{patient.observacoes}</p>
                </div>
              )}
            </div>

            {/* Resumo Clínico */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Comorbidades Pré-existentes */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-orange-500" />
                  Comorbidades Pré-existentes
                </h3>
                {loadingConditions ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Carregando...</p>
                  </div>
                ) : conditions.filter(c => c.source === 'PRE_EXISTING' && c.status === 'ACTIVE').length === 0 ? (
                  <p className="text-sm text-gray-500">Nenhuma comorbidade pré-existente registrada</p>
                ) : (
                  <div className="space-y-2">
                    {conditions
                      .filter(c => c.source === 'PRE_EXISTING' && c.status === 'ACTIVE')
                      .slice(0, 5)
                      .map((condition) => (
                        <div key={condition.id} className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-900">{condition.condition.name}</span>
                          {condition.isChronic && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              Crônica
                            </span>
                          )}
                        </div>
                      ))}
                    {conditions.filter(c => c.source === 'PRE_EXISTING' && c.status === 'ACTIVE').length > 5 && (
                      <p className="text-xs text-gray-500 text-center">
                        +{conditions.filter(c => c.source === 'PRE_EXISTING' && c.status === 'ACTIVE').length - 5} outras
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Medicamentos de Uso Contínuo */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-blue-500" />
                  Medicamentos de Uso Contínuo
                </h3>
                {loadingMedications ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Carregando...</p>
                  </div>
                ) : medications.filter(m => m.active).length === 0 ? (
                  <p className="text-sm text-gray-500">Nenhum medicamento de uso contínuo registrado</p>
                ) : (
                  <div className="space-y-2">
                    {medications
                      .filter(m => m.active)
                      .slice(0, 5)
                      .map((medication) => (
                        <div key={medication.id} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                                                     <div>
                             <span className="text-sm font-medium text-gray-900">{medication.name}</span>
                             {medication.dose && (
                               <p className="text-xs text-gray-500">{medication.dose}</p>
                             )}
                             {medication.frequency && (
                               <p className="text-xs text-gray-500">{medication.frequency}</p>
                             )}
                           </div>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Ativo
                          </span>
                        </div>
                      ))}
                    {medications.filter(m => m.active).length > 5 && (
                      <p className="text-xs text-gray-500 text-center">
                        +{medications.filter(m => m.active).length - 5} outros
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Alergias */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                Alergias
              </h3>
              {loadingAllergies ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Carregando...</p>
                </div>
              ) : allergies.filter(a => a.status === 'ACTIVE').length === 0 ? (
                <p className="text-sm text-gray-500">Nenhuma alergia registrada</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {allergies
                    .filter(a => a.status === 'ACTIVE')
                    .map((allergy) => (
                      <div key={allergy.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                        <div>
                          <span className="text-sm font-medium text-gray-900">{allergy.allergen.name}</span>
                          <p className="text-xs text-gray-500 capitalize">{getCategoryLabel(allergy.allergen.category)}</p>
                        </div>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {allergy.severity === 'MILD' ? 'Leve' :
                           allergy.severity === 'MODERATE' ? 'Moderada' :
                           allergy.severity === 'SEVERE' ? 'Severa' :
                           allergy.severity === 'UNKNOWN' ? 'Desconhecida' : allergy.severity}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Último Atendimento */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-green-500" />
                Último Atendimento
              </h3>
              {loadingAtendimentos ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Carregando...</p>
                </div>
              ) : atendimentos.length === 0 ? (
                <p className="text-sm text-gray-500">Nenhum atendimento registrado</p>
              ) : (
                <div className="space-y-4">
                  {atendimentos.slice(0, 1).map((atendimento) => (
                    <div key={atendimento.id} className="border rounded-lg p-4 bg-green-50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-gray-900">
                            {new Date(atendimento.serviceDate).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          atendimento.status === 'FINALIZADO' ? 'bg-green-100 text-green-800' :
                          atendimento.status === 'EM_ANDAMENTO' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {atendimento.status === 'FINALIZADO' ? 'Finalizado' :
                           atendimento.status === 'EM_ANDAMENTO' ? 'Em Andamento' :
                           'Cancelado'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                        <div>
                          <span className="font-medium">Evoluções:</span> {atendimento.evolucoes.length}
                        </div>
                        <div>
                          <span className="font-medium">Sinais Vitais:</span> {atendimento.sinaisVitais.length}
                        </div>
                        <div>
                          <span className="font-medium">Anexos:</span> {atendimento.anexos.length}
                        </div>
                        <div>
                          <span className="font-medium">Profissional:</span> Dr. {atendimento.profissional.nome}
                        </div>
                      </div>

                      {/* Texto da Evolução */}
                      {atendimento.evolucoes.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-green-200">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Evolução:</h4>
                          <div className="bg-white rounded-lg p-3 border">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                              {atendimento.evolucoes[0].texto}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Sinais Vitais */}
                      {atendimento.sinaisVitais.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-green-200">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Sinais Vitais:</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {atendimento.sinaisVitais[0] && (
                              <>
                                {atendimento.sinaisVitais[0].pressaoSistolica && atendimento.sinaisVitais[0].pressaoDiastolica && (
                                  <div className="bg-white rounded-lg p-2 border text-center">
                                    <p className="text-xs text-gray-500">PA</p>
                                    <p className="text-sm font-medium text-gray-900">
                                      {atendimento.sinaisVitais[0].pressaoSistolica}/{atendimento.sinaisVitais[0].pressaoDiastolica} mmHg
                                    </p>
                                  </div>
                                )}
                                {atendimento.sinaisVitais[0].frequenciaCardiaca && (
                                  <div className="bg-white rounded-lg p-2 border text-center">
                                    <p className="text-xs text-gray-500">FC</p>
                                    <p className="text-sm font-medium text-gray-900">
                                      {atendimento.sinaisVitais[0].frequenciaCardiaca} bpm
                                    </p>
                                  </div>
                                )}
                                {atendimento.sinaisVitais[0].temperatura && (
                                  <div className="bg-white rounded-lg p-2 border text-center">
                                    <p className="text-xs text-gray-500">Temp</p>
                                    <p className="text-sm font-medium text-gray-900">
                                      {atendimento.sinaisVitais[0].temperatura}°C
                                    </p>
                                  </div>
                                )}
                                {atendimento.sinaisVitais[0].frequenciaRespiratoria && (
                                  <div className="bg-white rounded-lg p-2 border text-center">
                                    <p className="text-xs text-gray-500">FR</p>
                                    <p className="text-sm font-medium text-gray-900">
                                      {atendimento.sinaisVitais[0].frequenciaRespiratoria} irpm
                                    </p>
                                  </div>
                                )}
                                {atendimento.sinaisVitais[0].saturacaoOxigenio && (
                                  <div className="bg-white rounded-lg p-2 border text-center">
                                    <p className="text-xs text-gray-500">SpO2</p>
                                    <p className="text-sm font-medium text-gray-900">
                                      {atendimento.sinaisVitais[0].saturacaoOxigenio}%
                                    </p>
                                  </div>
                                )}
                                {atendimento.sinaisVitais[0].peso && (
                                  <div className="bg-white rounded-lg p-2 border text-center">
                                    <p className="text-xs text-gray-500">Peso</p>
                                    <p className="text-sm font-medium text-gray-900">
                                      {atendimento.sinaisVitais[0].peso} kg
                                    </p>
                                  </div>
                                )}
                                {atendimento.sinaisVitais[0].altura && (
                                  <div className="bg-white rounded-lg p-2 border text-center">
                                    <p className="text-xs text-gray-500">Altura</p>
                                    <p className="text-sm font-medium text-gray-900">
                                      {atendimento.sinaisVitais[0].altura} cm
                                    </p>
                                  </div>
                                )}

                              </>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Diagnósticos do Atendimento */}
                      {loadingConditions ? (
                        <div className="mt-4 pt-3 border-t border-green-200">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Diagnósticos:</h4>
                          <div className="text-center py-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500 mx-auto"></div>
                            <p className="text-xs text-gray-500 mt-1">Carregando...</p>
                          </div>
                        </div>
                      ) : conditions.filter(c => c.source === 'DIAGNOSED' && c.appointmentId === atendimento.id).length > 0 ? (
                        <div className="mt-4 pt-3 border-t border-green-200">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Diagnósticos Informados:</h4>
                          <div className="space-y-2">
                            {conditions
                              .filter(c => c.source === 'DIAGNOSED' && c.appointmentId === atendimento.id)
                              .map((condition) => (
                                <div key={condition.id} className="flex items-center justify-between p-2 bg-green-100 rounded-lg">
                                  <span className="text-sm font-medium text-gray-900">{condition.condition.name}</span>
                                                                     <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                     condition.status === 'ACTIVE' ? 'bg-green-200 text-green-800' :
                                     condition.status === 'RESOLVED' ? 'bg-blue-200 text-blue-800' :
                                     'bg-gray-200 text-gray-800'
                                   }`}>
                                     {condition.status === 'ACTIVE' ? 'Ativo' :
                                      condition.status === 'RESOLVED' ? 'Curado' :
                                      condition.status}
                                   </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4 pt-3 border-t border-green-200">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Diagnósticos:</h4>
                          <p className="text-sm text-gray-500">Nenhum diagnóstico informado neste atendimento</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'evolutions' && (
          <div className="space-y-4">
            {/* Cabeçalho explicativo */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-blue-800">Integridade dos Dados Médicos</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Registros com status "Finalizado" são imutáveis conforme exigido pela ANS. 
                    Eles não podem ser editados para garantir a integridade e rastreabilidade dos dados médicos.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Evoluções</h3>
              <button
                onClick={() => setShowEvolutionForm(true)}
                disabled={!canCreateEvolution}
                className={`btn flex items-center ${
                  canCreateEvolution 
                    ? 'btn-primary' 
                    : 'btn-secondary opacity-50 cursor-not-allowed'
                }`}
                title={
                  !canCreateEvolution 
                    ? 'Há um atendimento em andamento. Finalize-o ou aguarde para iniciar um novo.' 
                    : 'Criar nova evolução'
                }
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Evolução
              </button>
            </div>

            {loadingEvolutions || loadingAtendimentos ? (
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Carregando evoluções e atendimentos...</p>
              </div>
            ) : evolutions.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma evolução encontrada</h3>
                <p className="text-gray-500 mb-4">Comece criando a primeira evolução do paciente.</p>
                <button
                  onClick={() => setShowEvolutionForm(true)}
                  disabled={!canCreateEvolution}
                  className={`btn ${
                    canCreateEvolution 
                      ? 'btn-primary' 
                      : 'btn-secondary opacity-50 cursor-not-allowed'
                  }`}
                  title={
                    !canCreateEvolution 
                      ? 'Há um atendimento em andamento. Finalize-o ou aguarde para iniciar um novo.' 
                      : 'Criar primeira evolução'
                  }
                >
                  Criar Primeira Evolução
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {evolutions.map((evolution) => (
                  <div
                    key={evolution.id}
                    className={`bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 ${
                      evolution.locked ? 'opacity-75' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-lg font-semibold text-gray-900">{evolution.resumo || 'Evolução'}</h4>
                          {evolution.locked && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Finalizado
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          Por {evolution.author?.nome || 'N/A'} em {formatDateTime(evolution.registradoEm)}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewEvolution(evolution)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                          title="Visualizar"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {!evolution.locked && (
                          <button
                            onClick={() => handleEditEvolution(evolution)}
                            className="text-primary-600 hover:text-primary-900 p-1 rounded transition-colors"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                        {evolution.locked && (
                          <button
                            disabled
                            className="text-gray-400 p-1 rounded cursor-not-allowed"
                            title="Registro finalizado - não pode ser editado"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="prose prose-sm max-w-none">
                      <div className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                        <p 
                          className="overflow-hidden"
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            wordBreak: 'break-word'
                          }}
                        >
                          {evolution.texto}
                        </p>
                        {evolution.texto.length > 200 && (
                          <p className="text-xs text-gray-500 mt-2 italic">
                            Clique em "Visualizar" para ver o texto completo
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'vitals' && (
          <div className="space-y-4">
            {/* Cabeçalho explicativo */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-blue-800">Integridade dos Dados Médicos</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Registros com status "Finalizado" são imutáveis conforme exigido pela ANS. 
                    Eles não podem ser editados para garantir a integridade e rastreabilidade dos dados médicos.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Sinais Vitais</h3>
              <button
                onClick={() => setShowVitalsForm(true)}
                disabled={!canCreateEvolution}
                className={`btn flex items-center ${
                  canCreateEvolution 
                    ? 'btn-primary' 
                    : 'btn-secondary opacity-50 cursor-not-allowed'
                }`}
                title={
                  !canCreateEvolution 
                    ? 'Há um atendimento em andamento. Finalize-o ou aguarde para iniciar um novo.' 
                    : 'Novo registro'
                }
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Registro
              </button>
            </div>

            {vitals.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8 text-center">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum registro de sinais vitais</h3>
                <p className="text-gray-500 mb-4">Comece registrando os primeiros sinais vitais do paciente.</p>
                <button
                  onClick={() => setShowVitalsForm(true)}
                  className="btn btn-primary"
                >
                  Registrar Sinais Vitais
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vitals.map((vital) => (
                  <div
                    key={vital.id}
                    className={`bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 ${
                      vital.locked ? 'opacity-75' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-lg font-semibold text-gray-900">
                            {formatDate(vital.registradoEm)}
                          </h4>
                          {vital.locked && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Finalizado
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          Por {vital.usuario?.nome || 'N/A'} em {formatDateTime(vital.registradoEm)}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewVitals(vital)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                          title="Visualizar"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {!vital.locked && (
                          <button
                            onClick={() => handleEditVitals(vital)}
                            className="text-primary-600 hover:text-primary-900 p-1 rounded transition-colors"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                        {vital.locked && (
                          <button
                            disabled
                            className="text-gray-400 p-1 rounded cursor-not-allowed"
                            title="Registro finalizado - não pode ser editado"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      {vital.pressaoSistolica && vital.pressaoDiastolica && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">PA:</span>
                          <span className="font-medium">
                            {vital.pressaoSistolica}/{vital.pressaoDiastolica} mmHg
                          </span>
                        </div>
                      )}
                      {vital.frequenciaCardiaca && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">FC:</span>
                          <span className="font-medium">{vital.frequenciaCardiaca} bpm</span>
                        </div>
                      )}
                      {vital.frequenciaRespiratoria && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">FR:</span>
                          <span className="font-medium">{vital.frequenciaRespiratoria} irpm</span>
                        </div>
                      )}
                      {vital.saturacaoOxigenio && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">SatO₂:</span>
                          <span className="font-medium">{vital.saturacaoOxigenio}%</span>
                        </div>
                      )}
                      {vital.temperatura && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Temp:</span>
                          <span className="font-medium">{vital.temperatura}°C</span>
                        </div>
                      )}
                      {vital.peso && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Peso:</span>
                          <span className="font-medium">{vital.peso} kg</span>
                        </div>
                      )}
                      {vital.altura && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Altura:</span>
                          <span className="font-medium">{vital.altura} cm</span>
                        </div>
                      )}
                      {vital.peso && vital.altura && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">IMC:</span>
                          <span className="font-medium">
                            {((vital.peso / Math.pow(vital.altura / 100, 2))).toFixed(1)} kg/m²
                          </span>
                        </div>
                      )}
                    </div>

                    {vital.observacoes && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-700">{vital.observacoes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'files' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Anexos</h3>
              <button
                onClick={() => setShowFileUploadForm(true)}
                className="btn btn-primary flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Upload Arquivo
              </button>
            </div>

            {files.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8 text-center">
                <Paperclip className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum arquivo anexado</h3>
                <p className="text-gray-500 mb-4">Comece fazendo upload dos primeiros arquivos do paciente.</p>
                <button
                  onClick={() => setShowFileUploadForm(true)}
                  className="btn btn-primary"
                >
                  Fazer Upload
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 truncate">{file.filename}</h4>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(file.size)} • {formatDateTime(file.createdAt)}
                        </p>
                        <p className="text-sm text-gray-500">{file.mimeType}</p>
                        
                        {/* Informações de retenção */}
                        {file.retainedUntil && (
                          <div className="mt-2 p-2 bg-blue-50 rounded-md">
                            <p className="text-xs text-blue-700">
                              <strong>Retenção:</strong> Até {new Date(file.retainedUntil).toLocaleDateString('pt-BR')}
                            </p>
                            {file.retentionReason && (
                              <p className="text-xs text-blue-600 mt-1">{file.retentionReason}</p>
                            )}
                          </div>
                        )}
                        
                        {file.legalHold && (
                          <div className="mt-2 p-2 bg-red-50 rounded-md">
                            <p className="text-xs text-red-700">
                              <strong>⚠️ Legal Hold:</strong> Documento protegido por litígio/auditoria
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2 ml-2">
                        <button
                          onClick={async () => {
                            try {
                              // Usar o novo sistema de download
                              const downloadUrl = await filesService.downloadFile(patient.id, file.id)
                              
                              // Criar link temporário para download
                              const link = document.createElement('a')
                              link.href = downloadUrl
                              link.download = file.filename
                              link.target = '_blank'
                              
                              document.body.appendChild(link)
                              link.click()
                              document.body.removeChild(link)
                              
                              toast.success('Download iniciado!')
                            } catch (error) {
                              toast.error('Erro ao fazer download do arquivo')
                              console.error(error)
                            }
                          }}
                          className="text-primary-600 hover:text-primary-900 p-1 rounded"
                          title="Baixar arquivo"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              // Verificar se pode ser excluído antes de tentar
                              const canDeleteResponse = await api.get(`/retention/anexo/${file.id}/can-delete`);
                              const canDelete = canDeleteResponse.data;
                              
                              if (!canDelete.canDelete) {
                                toast.error(canDelete.reason);
                                return;
                              }
                              
                              if (confirm('Tem certeza que deseja excluir este arquivo?')) {
                                // Usar o novo sistema de exclusão
                                await filesService.deleteFile(patient.id, file.id)
                                
                                toast.success('Arquivo excluído com sucesso!')
                                queryClient.invalidateQueries({ queryKey: ['patient-files', patient.id] })
                              }
                            } catch (error) {
                              toast.error('Erro ao excluir arquivo')
                              console.error(error)
                            }
                          }}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="Excluir arquivo"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'clinical' && (
          <ClinicalHistory patientId={patient.id} />
        )}

        {activeTab === 'atendimentos' && (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
            <AtendimentosDoDia patientId={patient.id} />
          </div>
        )}
      </div>

      {/* Formulários Modais */}
      {showEvolutionForm && (
        <EvolutionForm
          patientId={patient.id}
          onSuccess={handleEvolutionSuccess}
          onCancel={() => {
            setShowEvolutionForm(false)
            setEditingEvolution(null)
          }}
          evolution={editingEvolution || undefined}
        />
      )}

      {showVitalsForm && (
        <VitalsForm
          patientId={patient.id}
          onSuccess={handleVitalsSuccess}
          onCancel={() => {
            setShowVitalsForm(false)
            setEditingVitals(null)
          }}
          vitals={editingVitals || undefined}
        />
      )}

      {showFileUploadForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Paperclip className="h-6 w-6 text-primary-600" />
                <h2 className="text-xl font-bold text-gray-900">Adicionar Anexo</h2>
              </div>
              <button
                onClick={() => setShowFileUploadForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <SimpleAnexoUploader
                pacienteId={patient.id}
                onUploadComplete={handleFileUploadSuccess}
              />
            </div>
          </div>
        </div>
      )}

        {/* Modal de Visualização de Evolução */}
        {viewingEvolution && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <FileText className="h-6 w-6 text-primary-600" />
                  <h2 className="text-xl font-bold text-gray-900">Visualizar Evolução</h2>
                </div>
                <button
                  onClick={() => setViewingEvolution(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {viewingEvolution.resumo || 'Evolução'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Por {viewingEvolution.author?.nome || 'N/A'} em {formatDateTime(viewingEvolution.registradoEm)}
                  </p>
                </div>
                <div className="prose prose-sm max-w-none">
                  <div className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg overflow-x-auto">
                    <div 
                      className="whitespace-pre-wrap break-words"
                      style={{
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {viewingEvolution.texto}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Visualização de Sinais Vitais */}
        {viewingVitals && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <Activity className="h-6 w-6 text-primary-600" />
                  <h2 className="text-xl font-bold text-gray-900">Visualizar Sinais Vitais</h2>
                </div>
                <button
                  onClick={() => setViewingVitals(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {formatDate(viewingVitals.registradoEm)}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Por {viewingVitals.usuario?.nome || 'N/A'} em {formatDateTime(viewingVitals.registradoEm)}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="font-medium text-gray-700">Pressão Arterial:</span>
                    <p className="text-gray-900">{viewingVitals.pressaoSistolica}/{viewingVitals.pressaoDiastolica} mmHg</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="font-medium text-gray-700">Freq. Cardíaca:</span>
                    <p className="text-gray-900">{viewingVitals.frequenciaCardiaca} bpm</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="font-medium text-gray-700">Freq. Respiratória:</span>
                    <p className="text-gray-900">{viewingVitals.frequenciaRespiratoria} irpm</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="font-medium text-gray-700">Saturação O₂:</span>
                    <p className="text-gray-900">{viewingVitals.saturacaoOxigenio}%</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="font-medium text-gray-700">Temperatura:</span>
                    <p className="text-gray-900">{viewingVitals.temperatura}°C</p>
                  </div>
                  {viewingVitals.peso && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="font-medium text-gray-700">Peso:</span>
                      <p className="text-gray-900">{viewingVitals.peso} kg</p>
                    </div>
                  )}
                  {viewingVitals.altura && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="font-medium text-gray-700">Altura:</span>
                      <p className="text-gray-900">{viewingVitals.altura} cm</p>
                    </div>
                  )}
                  {viewingVitals.peso && viewingVitals.altura && (
                    <div className="bg-gray-50 p-3 rounded-lg col-span-2">
                      <span className="font-medium text-gray-700">IMC:</span>
                      <p className="text-gray-900">
                        {Math.round((viewingVitals.peso / Math.pow(viewingVitals.altura / 100, 2)) * 100) / 100} kg/m²
                      </p>
                    </div>
                  )}
                  {viewingVitals.observacoes && (
                    <div className="bg-gray-50 p-3 rounded-lg col-span-2">
                      <span className="font-medium text-gray-700">Observações:</span>
                      <p className="text-gray-900">{viewingVitals.observacoes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  )
}
