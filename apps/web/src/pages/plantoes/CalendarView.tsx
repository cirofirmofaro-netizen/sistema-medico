import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin } from 'lucide-react'
import { plantoesService, Plantao } from '../../services/plantoes'
import EditPlantaoDialog from './components/EditPlantaoDialog'

interface CalendarViewProps {
  selectedMonth: number
  selectedYear: number
  selectedStatus: string
  searchTerm: string
}

export function CalendarView({ selectedMonth, selectedYear, selectedStatus, searchTerm }: CalendarViewProps) {
  const [selectedPlantao, setSelectedPlantao] = useState<Plantao | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)

  // Calcular primeiro e último dia do mês
  const { firstDay, lastDay, daysInMonth, firstDayOfWeek } = useMemo(() => {
    const date = new Date(selectedYear, selectedMonth - 1, 1)
    const firstDay = new Date(date)
    const lastDay = new Date(selectedYear, selectedMonth, 0)
    const daysInMonth = lastDay.getDate()
    const firstDayOfWeek = date.getDay()
    
    return { firstDay, lastDay, daysInMonth, firstDayOfWeek }
  }, [selectedMonth, selectedYear])

  // Buscar plantões do mês
  const { data: plantoes, isLoading } = useQuery({
    queryKey: ['plantoes-calendar', selectedMonth, selectedYear, selectedStatus, searchTerm],
    queryFn: () => plantoesService.listPlantoes({ 
      mes: selectedMonth,
      ano: selectedYear,
      status: selectedStatus as Plantao['status'] || undefined,
      q: searchTerm,
      limit: 100 // Buscar mais plantões para o calendário
    }),
  })

  // Organizar plantões por dia
  const plantoesPorDia = useMemo(() => {
    const plantoesMap = new Map<number, Plantao[]>()
    
    plantoes?.plantoes.forEach(plantao => {
      const dia = new Date(plantao.data).getDate()
      if (!plantoesMap.has(dia)) {
        plantoesMap.set(dia, [])
      }
      plantoesMap.get(dia)!.push(plantao)
    })
    
    return plantoesMap
  }, [plantoes])

  // Gerar dias do calendário
  const calendarDays = useMemo(() => {
    const days = []
    
    // Dias vazios do início
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ day: null, plantoes: [] })
    }
    
    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ 
        day, 
        plantoes: plantoesPorDia.get(day) || [] 
      })
    }
    
    return days
  }, [firstDayOfWeek, daysInMonth, plantoesPorDia])

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5)
  }

  const getStatusColor = (status: Plantao['status']) => {
    switch (status) {
      case 'PENDENTE': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'CONFIRMADO': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'CANCELADO': return 'bg-red-100 text-red-800 border-red-200'
      case 'REALIZADO': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handlePlantaoClick = (plantao: Plantao) => {
    setSelectedPlantao(plantao)
    setShowEditDialog(true)
  }

  const getMonthName = (month: number) => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ]
    return months[month - 1]
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Carregando calendário...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header do Calendário */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          {getMonthName(selectedMonth)} {selectedYear}
        </h2>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>Visualização de Calendário</span>
        </div>
      </div>

      {/* Calendário */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        {/* Dias da semana */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <div key={day} className="p-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Grade do calendário */}
        <div className="grid grid-cols-7">
          {calendarDays.map(({ day, plantoes }, index) => (
            <div
              key={index}
              className={`min-h-[120px] border-r border-b border-gray-200 p-2 ${
                day ? 'bg-white hover:bg-gray-50' : 'bg-gray-50'
              }`}
            >
              {day && (
                <>
                  {/* Número do dia */}
                  <div className="text-sm font-medium text-gray-900 mb-1">
                    {day}
                  </div>
                  
                  {/* Plantões do dia */}
                  <div className="space-y-1">
                    {plantoes.slice(0, 3).map((plantao) => (
                      <button
                        key={plantao.id}
                        onClick={() => handlePlantaoClick(plantao)}
                        className={`w-full text-left p-1.5 rounded text-xs border transition-all hover:shadow-sm ${getStatusColor(plantao.status)}`}
                        title={`${plantao.local} - ${formatTime(plantao.horaInicio)} às ${formatTime(plantao.horaFim)}`}
                      >
                        <div className="flex items-center space-x-1 mb-0.5">
                          <Clock className="h-2.5 w-2.5" />
                          <span className="font-medium">
                            {formatTime(plantao.horaInicio)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 truncate">
                          <MapPin className="h-2.5 w-2.5 flex-shrink-0" />
                          <span className="truncate">{plantao.local}</span>
                        </div>
                      </button>
                    ))}
                    
                    {/* Indicador de mais plantões */}
                    {plantoes.length > 3 && (
                      <div className="text-xs text-gray-500 text-center py-1">
                        +{plantoes.length - 3} mais
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Legenda */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Legenda</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded"></div>
            <span className="text-xs text-gray-600">Pendente</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></div>
            <span className="text-xs text-gray-600">Confirmado</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
            <span className="text-xs text-gray-600">Cancelado</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
            <span className="text-xs text-gray-600">Realizado</span>
          </div>
        </div>
      </div>

      {/* Dialog de edição */}
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
        }}
      />
    </div>
  )
}
