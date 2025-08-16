import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Filter,
  Clock,
  MapPin,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  PlayCircle,
  List,
  Video
} from 'lucide-react'
import { appointmentsService, Appointment } from '../../services/appointments'
import { patientsService } from '../../services/patients'
import ConfirmDialog from '../pacientes/components/ConfirmDialog'

type ViewMode = 'list' | 'calendar'

export function Appointments() {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const navigate = useNavigate()

  // Calcular intervalo do mês
  const { fromDate, toDate } = useMemo(() => {
    const startOfMonth = new Date(selectedYear, selectedMonth - 1, 1)
    const endOfMonth = new Date(selectedYear, selectedMonth, 0)
    
    return {
      fromDate: startOfMonth.toISOString().split('T')[0],
      toDate: endOfMonth.toISOString().split('T')[0]
    }
  }, [selectedMonth, selectedYear])

  // Query para listar consultas
  const { data, isLoading, error } = useQuery({
    queryKey: ['appointments', fromDate, toDate, selectedStatus, searchTerm, currentPage],
    queryFn: () => appointmentsService.listAppointments({
      from: fromDate,
      to: toDate,
      status: selectedStatus || undefined,
      page: currentPage,
      limit: 10
    }),
    placeholderData: (previousData) => previousData
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5)
  }

  const getStatusBadge = (status: Appointment['status']) => {
    const statusConfig = {
      AGENDADA: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
      CONFIRMADA: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      CONCLUIDA: { color: 'bg-green-100 text-green-800', icon: PlayCircle },
      CANCELADA: { color: 'bg-red-100 text-red-800', icon: XCircle }
    }

    const config = statusConfig[status]
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {status === 'AGENDADA' && 'Agendada'}
        {status === 'CONFIRMADA' && 'Confirmada'}
        {status === 'CONCLUIDA' && 'Concluída'}
        {status === 'CANCELADA' && 'Cancelada'}
      </span>
    )
  }

  const getTypeBadge = (type: Appointment['tipo']) => {
    const typeConfig = {
      PRESENCIAL: { color: 'bg-purple-100 text-purple-800', icon: User },
      TELEMEDICINA: { color: 'bg-indigo-100 text-indigo-800', icon: Video }
    }

    const config = typeConfig[type]
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {type === 'PRESENCIAL' && 'Presencial'}
        {type === 'TELEMEDICINA' && 'Telemedicina'}
      </span>
    )
  }

  const handleDelete = (appointment: Appointment) => {
    setAppointmentToDelete(appointment)
    setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    if (appointmentToDelete) {
      // Implementar exclusão
      toast.error('Funcionalidade em desenvolvimento')
      setShowDeleteDialog(false)
      setAppointmentToDelete(null)
    }
  }

  const handleStartTeleconsultation = (appointment: Appointment) => {
    if (appointment.tipo === 'TELEMEDICINA') {
      navigate(`/telemedicine/${appointment.id}`)
    }
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Erro ao carregar consultas</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Consultas</h1>
          <p className="text-gray-600 mt-1">
            {data ? `${data.total} consultas encontradas` : 'Carregando...'}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          {/* Toggle de visualização */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="h-4 w-4 inline mr-1" />
              Lista
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="h-4 w-4 inline mr-1" />
              Calendário
            </button>
          </div>

          {/* Botão nova consulta */}
          <button
            onClick={() => navigate('/appointments/new')}
            className="btn btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Consulta
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Busca */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por paciente, local..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>

          {/* Mês */}
          <div>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="input"
            >
              <option value={1}>Janeiro</option>
              <option value={2}>Fevereiro</option>
              <option value={3}>Março</option>
              <option value={4}>Abril</option>
              <option value={5}>Maio</option>
              <option value={6}>Junho</option>
              <option value={7}>Julho</option>
              <option value={8}>Agosto</option>
              <option value={9}>Setembro</option>
              <option value={10}>Outubro</option>
              <option value={11}>Novembro</option>
              <option value={12}>Dezembro</option>
            </select>
          </div>

          {/* Ano */}
          <div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="input"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input"
            >
              <option value="">Todos os status</option>
              <option value="AGENDADA">Agendada</option>
              <option value="CONFIRMADA">Confirmada</option>
              <option value="CONCLUIDA">Concluída</option>
              <option value="CANCELADA">Cancelada</option>
            </select>
          </div>
        </div>
      </div>

      {/* Conteúdo baseado no modo de visualização */}
      {viewMode === 'calendar' ? (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Visualização de Calendário</h3>
            <p className="text-gray-500">Funcionalidade em desenvolvimento</p>
          </div>
        </div>
      ) : (
        /* Tabela de lista */
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paciente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Local/Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
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
                      Carregando consultas...
                    </td>
                  </tr>
                ) : data?.appointments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      Nenhuma consulta encontrada
                    </td>
                  </tr>
                ) : (
                  data?.appointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {formatDate(appointment.data)}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTime(appointment.horaInicio)} - {formatTime(appointment.horaFim)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {appointment.patientName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {appointment.local}
                          </div>
                          <div className="mt-1">
                            {getTypeBadge(appointment.tipo)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(appointment.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          {appointment.tipo === 'TELEMEDICINA' && appointment.status === 'CONFIRMADA' && (
                            <button
                              onClick={() => handleStartTeleconsultation(appointment)}
                              className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                              title="Iniciar Teleconsulta"
                            >
                              <Video className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/appointments/${appointment.id}/edit`)}
                            className="text-primary-600 hover:text-primary-900 p-1 rounded"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(appointment)}
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
                    </span> de{' '}
                    <span className="font-medium">{data.total}</span> resultados
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
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        title="Excluir Consulta"
        description={`Tem certeza que deseja excluir a consulta do dia ${appointmentToDelete ? formatDate(appointmentToDelete.data) : ''}? Esta ação não pode ser desfeita.`}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteDialog(false)
          setAppointmentToDelete(null)
        }}
      />
    </div>
  )
}
