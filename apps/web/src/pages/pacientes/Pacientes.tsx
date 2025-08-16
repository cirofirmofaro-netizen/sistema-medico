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
  Filter
} from 'lucide-react'
import { pacientesService, Paciente } from '../../services/pacientes'
import NewPacienteDialog from './components/NewPacienteDialog'
import EditPacienteDialog from './components/EditPacienteDialog'
import ConfirmDialog from './components/ConfirmDialog'

export function Pacientes() {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null)
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [pacienteToDelete, setPacienteToDelete] = useState<Paciente | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  // Query para listar pacientes
  const { data, isLoading, error } = useQuery({
    queryKey: ['pacientes', searchTerm, currentPage],
    queryFn: () => pacientesService.listPacientes({ 
      q: searchTerm, 
      page: currentPage,
      limit: 10 
    }),
    placeholderData: (previousData) => previousData
  })

  // Mutation para deletar paciente
  const deleteMutation = useMutation({
    mutationFn: pacientesService.deletePaciente,
    onSuccess: () => {
      toast.success('Paciente excluído com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['pacientes'] })
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
        setShowNewDialog(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Resetar página quando busca mudar
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const handleDelete = (paciente: Paciente) => {
    setPacienteToDelete(paciente)
    setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    if (pacienteToDelete) {
      deleteMutation.mutate(pacienteToDelete.id)
      setShowDeleteDialog(false)
      setPacienteToDelete(null)
    }
  }

  const formatDate = (dateString: string) => {
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
            onClick={() => setShowNewDialog(true)}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paciente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Idade/Sexo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cadastro
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
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
                data?.pacientes.map((paciente) => (
                  <tr key={paciente.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {paciente.nome}
                        </div>
                        <div className="text-sm text-gray-500">
                          CPF: {paciente.cpf || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {paciente.telefone || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {paciente.email || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatAge(paciente.dtNasc)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatGender(paciente.sexo)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(paciente.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedPaciente(paciente)
                            setShowEditDialog(true)
                          }}
                          className="text-primary-600 hover:text-primary-900 p-1 rounded"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(paciente)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
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
        {data && data.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="btn btn-secondary"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(data.totalPages, currentPage + 1))}
                disabled={currentPage === data.totalPages}
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
                    {Math.min(currentPage * 10, data.total)}
                  </span>{' '}
                  de <span className="font-medium">{data.total}</span> resultados
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
                    onClick={() => setCurrentPage(Math.min(data.totalPages, currentPage + 1))}
                    disabled={currentPage === data.totalPages}
                    className="btn btn-secondary"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <NewPacienteDialog
        open={showNewDialog}
        onOpenChange={(open) => setShowNewDialog(open)}
        onCreated={() => {
          queryClient.invalidateQueries({ queryKey: ['pacientes'] })
        }}
      />

      <EditPacienteDialog
        paciente={selectedPaciente}
        onOpenChange={(open) => {
          setShowEditDialog(open)
          if (!open) setSelectedPaciente(null)
        }}
        onSaved={() => {
          queryClient.invalidateQueries({ queryKey: ['pacientes'] })
        }}
      />

      <ConfirmDialog
        open={showDeleteDialog}
        title="Excluir Paciente"
        description={`Tem certeza que deseja excluir o paciente "${pacienteToDelete?.nome}"? Esta ação não pode ser desfeita.`}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteDialog(false)
          setPacienteToDelete(null)
        }}
      />
    </div>
  )
}
