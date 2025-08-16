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
  Calendar,
  Filter,
  Clock,
  MapPin,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  PlayCircle,
  List,
  Bell,
  Settings,
  Eye
} from 'lucide-react'
import { plantoesService, Plantao } from '../../services/plantoes'
import { useNavigate } from 'react-router-dom'
import { notificationService, NotificationPreferences } from '../../services/notifications'
import NewPlantaoDialog from './components/NewPlantaoDialog'
import EditPlantaoDialog from './components/EditPlantaoDialog'
import ConfirmDialog from '../pacientes/components/ConfirmDialog'
import { CalendarView } from './CalendarView'

type ViewMode = 'list' | 'calendar'

export function Plantoes() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedPlantao, setSelectedPlantao] = useState<Plantao | null>(null)
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showNotificationsDialog, setShowNotificationsDialog] = useState(false)
  const [plantaoToDelete, setPlantaoToDelete] = useState<Plantao | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>({
    enabled: true,
    reminders24h: true,
    reminders1h: true,
    sound: true
  })
  const searchInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  // Carregar preferências de notificação
  useEffect(() => {
    const prefs = notificationService.getPreferences()
    setNotificationPrefs(prefs)
  }, [])

  // Query para listar plantões
  const { data, isLoading, error } = useQuery({
    queryKey: ['plantoes', searchTerm, currentPage, selectedMonth, selectedYear, selectedStatus],
    queryFn: () => plantoesService.listPlantoes({ 
      q: searchTerm, 
      page: currentPage,
      limit: 10,
      mes: selectedMonth,
      ano: selectedYear,
      status: selectedStatus as Plantao['status'] || undefined
    }),
    placeholderData: (previousData) => previousData
  })

  // Mutation para deletar plantão
  const deleteMutation = useMutation({
    mutationFn: plantoesService.deletePlantao,
    onSuccess: () => {
      toast.success('Plantão excluído com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['plantoes'] })
    },
    onError: () => {
      toast.error('Erro ao excluir plantão')
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

  // Resetar página quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedMonth, selectedYear, selectedStatus])

  const handleDelete = (plantao: Plantao) => {
    setPlantaoToDelete(plantao)
    setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    if (plantaoToDelete) {
      deleteMutation.mutate(plantaoToDelete.id)
      setShowDeleteDialog(false)
      setPlantaoToDelete(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getStatusBadge = (status: Plantao['status']) => {
    const statusConfig = {
      PENDENTE: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
      CONFIRMADO: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      CANCELADO: { color: 'bg-red-100 text-red-800', icon: XCircle },
      REALIZADO: { color: 'bg-green-100 text-green-800', icon: PlayCircle }
    }

    const config = statusConfig[status]
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {status === 'PENDENTE' && 'Pendente'}
        {status === 'CONFIRMADO' && 'Confirmado'}
        {status === 'CANCELADO' && 'Cancelado'}
        {status === 'REALIZADO' && 'Realizado'}
      </span>
    )
  }

  const getEspecialidadeLabel = (especialidade: string) => {
    const labels: Record<string, string> = {
      CLINICO_GERAL: 'Clínico Geral',
      PEDIATRIA: 'Pediatria',
      CIRURGIA: 'Cirurgia',
      CARDIOLOGIA: 'Cardiologia',
      ORTOPEDIA: 'Ortopedia',
      NEUROLOGIA: 'Neurologia',
      PSIQUIATRIA: 'Psiquiatria',
      GINECOLOGIA: 'Ginecologia',
      OBSTETRICIA: 'Obstetrícia',
      UROLOGIA: 'Urologia',
      DERMATOLOGIA: 'Dermatologia',
      OFTALMOLOGIA: 'Oftalmologia',
      OTORRINOLARINGOLOGIA: 'Otorrinolaringologia',
      RADIOLOGIA: 'Radiologia',
      ANESTESIOLOGIA: 'Anestesiologia',
      EMERGENCIA: 'Emergência',
      UTI: 'UTI',
      OUTROS: 'Outros'
    }
    return labels[especialidade] || especialidade
  }

  const handleNotificationPrefsChange = (prefs: Partial<NotificationPreferences>) => {
    const newPrefs = { ...notificationPrefs, ...prefs }
    setNotificationPrefs(newPrefs)
    notificationService.updatePreferences(newPrefs)
    toast.success('Preferências de notificação atualizadas!')
  }

  const handleTestNotification = async () => {
    try {
      await notificationService.testNotification()
      toast.success('Notificação de teste enviada!')
    } catch (error) {
      toast.error('Erro ao enviar notificação de teste')
    }
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Erro ao carregar plantões</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plantões</h1>
          <p className="text-gray-600 mt-1">
            {data ? `${data.total} plantões encontrados` : 'Carregando...'}
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

          {/* Botão de notificações */}
          <button
            onClick={() => setShowNotificationsDialog(true)}
            className="btn btn-secondary flex items-center"
          >
            <Bell className="h-4 w-4 mr-2" />
            Lembretes
          </button>

          {/* Botão novo plantão */}
          <button
            onClick={() => setShowNewDialog(true)}
            className="btn btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Plantão
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Busca */}
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Buscar por local, especialidade..."
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
              <option value="PENDENTE">Pendente</option>
              <option value="CONFIRMADO">Confirmado</option>
              <option value="CANCELADO">Cancelado</option>
              <option value="REALIZADO">Realizado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Conteúdo baseado no modo de visualização */}
      {viewMode === 'calendar' ? (
        <CalendarView
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          selectedStatus={selectedStatus}
          searchTerm={searchTerm}
        />
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
                    Local/Especialidade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
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
                      Carregando plantões...
                    </td>
                  </tr>
                ) : data?.items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      Nenhum plantão encontrado
                    </td>
                  </tr>
                ) : (
                  data?.items.map((plantao) => (
                    <tr key={plantao.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {formatDate(plantao.inicio)}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTime(plantao.inicio)} - {formatTime(plantao.fim)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {plantao.local}
                          </div>
                          <div className="text-sm text-gray-500">
                            {plantao.tipo}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 flex items-center">
                          <DollarSign className="h-3 w-3 mr-1" />
                          {formatCurrency(plantao.valorBruto)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(plantao.statusPgto)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => navigate(`/plantoes/${plantao.id}`)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                            title="Ver detalhes"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPlantao(plantao)
                              setShowEditDialog(true)
                            }}
                            className="text-primary-600 hover:text-primary-900 p-1 rounded"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(plantao)}
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
      )}

      {/* Dialogs */}
      <NewPlantaoDialog
        open={showNewDialog}
        onClose={() => setShowNewDialog(false)}
        onSuccess={() => {
          setShowNewDialog(false)
          queryClient.invalidateQueries({ queryKey: ['plantoes'] })
        }}
      />

      <EditPlantaoDialog
        open={showEditDialog}
        plantao={selectedPlantao}
        onClose={() => {
          setShowEditDialog(false)
          setSelectedPlantao(null)
        }}
        onSuccess={() => {
          setShowEditDialog(false)
          setSelectedPlantao(null)
          queryClient.invalidateQueries({ queryKey: ['plantoes'] })
        }}
      />

      <ConfirmDialog
        open={showDeleteDialog}
        title="Excluir Plantão"
        description={`Tem certeza que deseja excluir o plantão do dia ${plantaoToDelete ? formatDate(plantaoToDelete.data) : ''}? Esta ação não pode ser desfeita.`}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteDialog(false)
          setPlantaoToDelete(null)
        }}
      />

      {/* Dialog de Notificações */}
      {showNotificationsDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Configurar Lembretes</h2>
              <button
                onClick={() => setShowNotificationsDialog(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Habilitar notificações */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Lembretes Ativos</h3>
                  <p className="text-sm text-gray-500">Receber notificações de plantões</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationPrefs.enabled}
                    onChange={(e) => handleNotificationPrefsChange({ enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              {/* Opções de lembretes */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">24 horas antes</h4>
                    <p className="text-sm text-gray-500">Lembrete no dia anterior</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationPrefs.reminders24h}
                      onChange={(e) => handleNotificationPrefsChange({ reminders24h: e.target.checked })}
                      disabled={!notificationPrefs.enabled}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 peer-disabled:opacity-50"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">1 hora antes</h4>
                    <p className="text-sm text-gray-500">Lembrete próximo ao horário</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationPrefs.reminders1h}
                      onChange={(e) => handleNotificationPrefsChange({ reminders1h: e.target.checked })}
                      disabled={!notificationPrefs.enabled}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 peer-disabled:opacity-50"></div>
                  </label>
                </div>
              </div>

              {/* Teste de notificação */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleTestNotification}
                  disabled={!notificationPrefs.enabled}
                  className="btn btn-primary w-full"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Testar Notificação
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
