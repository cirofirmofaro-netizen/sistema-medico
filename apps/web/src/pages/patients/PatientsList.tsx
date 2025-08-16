import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Users,
  Filter,
  Eye,
  Calendar,
  Phone,
  Mail,
  MapPin
} from 'lucide-react'
import { patientsService, Patient } from '../../services/patients'
import { useNavigate } from 'react-router-dom'
import ConfirmDialog from '../pacientes/components/ConfirmDialog'
import PatientForm from './components/PatientForm'

export function PatientsList() {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null)
  const [showPatientForm, setShowPatientForm] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  // Query para listar pacientes
  const { data, isLoading, error } = useQuery({
    queryKey: ['patients', searchTerm, currentPage],
    queryFn: () => patientsService.listPatients({
      q: searchTerm, // O serviço já converte 'q' para 'search'
      page: currentPage,
      limit: 10
    }),
    placeholderData: (previousData) => previousData
  })

  // Mutation para deletar paciente
  const deleteMutation = useMutation({
    mutationFn: patientsService.deletePatient,
    onSuccess: () => {
      toast.success('Paciente excluído com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['patients'] })
    },
    onError: () => {
      toast.error('Erro ao excluir paciente')
    }
  })

  // Focar no campo de busca com "/"
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
      if (e.key === 'n' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        navigate('/patients/new')
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [navigate])

  // Resetar página quando busca mudar
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const handleDelete = (patient: Patient) => {
    setPatientToDelete(patient)
    setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    if (patientToDelete) {
      deleteMutation.mutate(patientToDelete.id)
      setShowDeleteDialog(false)
      setPatientToDelete(null)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatAge = (dateString: string | null) => {
    if (!dateString) return 'N/A'

    const birthDate = new Date(dateString)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return `${age} anos`
  }

  const formatGender = (gender: string | null) => {
    if (!gender) return 'N/A'
    return gender === 'M' ? 'Masculino' : gender === 'F' ? 'Feminino' : gender
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Erro ao carregar pacientes</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pacientes</h1>
          <p className="text-gray-600 mt-1">
            {data ? `${data.total} pacientes encontrados` : 'Carregando...'}
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setShowPatientForm(true)}
            className="btn btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Paciente
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Buscar por nome, CPF, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
        <button className="btn btn-secondary flex items-center">
          <Filter className="h-4 w-4 mr-2" />
          Filtros
        </button>
      </div>

      {/* Table */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome / CPF</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contato</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Idade / Sexo</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Endereço</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Carregando pacientes...
                  </td>
                </tr>
                             ) : data?.pacientes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Nenhum paciente encontrado
                  </td>
                </tr>
              ) : (
                                 data?.pacientes.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {patient.nome}
                      </div>
                      <div className="text-sm text-gray-500">
                        CPF: {patient.cpf || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {patient.telefone || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {patient.email || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                                                 {formatAge(patient.dtNasc)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatGender(patient.sexo)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {patient.endereco || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => navigate(`/patients/${patient.id}`)}
                          className="text-primary-600 hover:text-primary-900 p-1 rounded"
                          title="Ver detalhes"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPatient(patient)
                            setShowPatientForm(true)
                          }}
                          className="text-primary-600 hover:text-primary-900 p-1 rounded"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(patient)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="btn btn-secondary"
            >
              Anterior
            </button>
                              <button
                    onClick={() => setCurrentPage(Math.min(data?.totalPages || 1, currentPage + 1))}
                    disabled={currentPage === data?.totalPages}
                    className="btn btn-secondary"
                  >
              Próxima
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{((currentPage - 1) * 10) + 1}</span> a{' '}
                <span className="font-medium">
                  {Math.min(currentPage * 10, data?.total || 0)}
                </span> de{' '}
                <span className="font-medium">{data?.total || 0}</span> resultados
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="btn btn-secondary"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(data?.totalPages || 1, currentPage + 1))}
                  disabled={currentPage === data?.totalPages}
                  className="btn btn-secondary"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Form Dialog */}
      <PatientForm
        open={showPatientForm}
        paciente={selectedPatient}
        onClose={() => {
          setShowPatientForm(false)
          setSelectedPatient(null)
        }}
        onSuccess={() => {
          setShowPatientForm(false)
          setSelectedPatient(null)
          queryClient.invalidateQueries({ queryKey: ['patients'] })
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        title="Excluir Paciente"
        description={`Tem certeza que deseja excluir o paciente "${patientToDelete?.nome}"? Esta ação não pode ser desfeita.`}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteDialog(false)
          setPatientToDelete(null)
        }}
      />
    </div>
  )
}
