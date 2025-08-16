import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts'
import { 
  Download, 
  Printer, 
  DollarSign, 
  Clock, 
  Calendar, 
  TrendingUp,
  Building,
  CheckCircle
} from 'lucide-react'
import { plantoesService, Plantao } from '../../services/plantoes'
import { ExportCsvButton } from '../../components/common/ExportCsvButton'

export function PlantoesReport() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [descontoPercentual, setDescontoPercentual] = useState(0)

  // Buscar dados do mês
  const { data: plantoesData, isLoading } = useQuery({
    queryKey: ['plantoes-report', selectedMonth, selectedYear],
    queryFn: () => plantoesService.listPlantoes({ 
      mes: selectedMonth,
      ano: selectedYear,
      limit: 1000 // Buscar todos os plantões do mês
    }),
  })

  // Calcular estatísticas
  const stats = useMemo(() => {
    if (!plantoesData?.items) return null

    const plantoes = plantoesData.items
    const totalPlantoes = plantoes.length
    let horasTrabalhadas = 0
    let valorBruto = 0
    let valorLiquido = 0

    // Agrupar por estabelecimento
    const porEstabelecimento = new Map<string, {
      nome: string
      total: number
      valor: number
      horas: number
    }>()

    // Agrupar por status
    const porStatus = new Map<string, {
      status: string
      total: number
      valor: number
    }>()

    plantoes.forEach(plantao => {
      // Calcular horas trabalhadas
      const inicio = new Date(`2000-01-01T${plantao.horaInicio}`)
      const fim = new Date(`2000-01-01T${plantao.horaFim}`)
      const horas = (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60)
      horasTrabalhadas += horas

      // Valores
      valorBruto += plantao.valor

      // Por estabelecimento
      if (!porEstabelecimento.has(plantao.local)) {
        porEstabelecimento.set(plantao.local, {
          nome: plantao.local,
          total: 0,
          valor: 0,
          horas: 0
        })
      }
      const estabelecimento = porEstabelecimento.get(plantao.local)!
      estabelecimento.total++
      estabelecimento.valor += plantao.valor
      estabelecimento.horas += horas

      // Por status
      if (!porStatus.has(plantao.status)) {
        porStatus.set(plantao.status, {
          status: plantao.status,
          total: 0,
          valor: 0
        })
      }
      const status = porStatus.get(plantao.status)!
      status.total++
      status.valor += plantao.valor
    })

    // Calcular valor líquido
    const desconto = valorBruto * (descontoPercentual / 100)
    valorLiquido = valorBruto - desconto

    return {
      totalPlantoes,
      horasTrabalhadas: Math.round(horasTrabalhadas * 100) / 100,
      valorBruto,
      valorLiquido,
      desconto,
      porEstabelecimento: Array.from(porEstabelecimento.values()),
      porStatus: Array.from(porStatus.values())
    }
  }, [plantoesData, descontoPercentual])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDENTE: 'Pendente',
      CONFIRMADO: 'Confirmado',
      CANCELADO: 'Cancelado',
      REALIZADO: 'Realizado'
    }
    return labels[status] || status
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDENTE: '#fbbf24',
      CONFIRMADO: '#3b82f6',
      CANCELADO: '#ef4444',
      REALIZADO: '#10b981'
    }
    return colors[status] || '#6b7280'
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

  const handleExportCsv = () => {
    if (!plantoesData?.plantoes) return

    const headers = [
      'Data',
      'Hora Início',
      'Hora Fim',
      'Local',
      'Especialidade',
      'Status',
      'Valor',
      'Observações'
    ]

    const rows = plantoesData.items.map(plantao => [
              plantao.inicio,
              formatTime(plantao.inicio),
        formatTime(plantao.fim),
      plantao.local,
              plantao.tipo,
              plantao.statusPgto,
        plantao.valorBruto.toString(),
              plantao.notas || ''
    ])

    // Adicionar linha de totais
    if (stats) {
      rows.push([
        '',
        '',
        '',
        '',
        '',
        'TOTAIS',
        stats.valorBruto.toString(),
        ''
      ])
    }

    return { headers, rows, filename: `plantoes-${selectedMonth}-${selectedYear}.csv` }
  }

  const handlePrint = () => {
    window.print()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Carregando relatório...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatório de Plantões</h1>
          <p className="text-gray-600 mt-1">
            {new Date(selectedYear, selectedMonth - 1).toLocaleDateString('pt-BR', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <ExportCsvButton onExport={handleExportCsv} />
          <button
            onClick={handlePrint}
            className="btn btn-secondary flex items-center"
          >
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mês
            </label>
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

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ano
            </label>
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

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Desconto (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={descontoPercentual}
              onChange={(e) => setDescontoPercentual(Number(e.target.value))}
              className="input"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {stats && (
        <>
          {/* Cards de estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Plantões</p>
                  <p className="text-3xl font-bold mt-1">{stats.totalPlantoes}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Calendar className="h-8 w-8" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Horas Trabalhadas</p>
                  <p className="text-3xl font-bold mt-1">{stats.horasTrabalhadas}h</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Clock className="h-8 w-8" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Valor Bruto</p>
                  <p className="text-3xl font-bold mt-1">{formatCurrency(stats.valorBruto)}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <DollarSign className="h-8 w-8" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Valor Líquido</p>
                  <p className="text-3xl font-bold mt-1">{formatCurrency(stats.valorLiquido)}</p>
                  {descontoPercentual > 0 && (
                    <p className="text-orange-100 text-sm mt-1">
                      -{formatCurrency(stats.desconto)}
                    </p>
                  )}
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <TrendingUp className="h-8 w-8" />
                </div>
              </div>
            </div>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico por estabelecimento */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Por Estabelecimento
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.porEstabelecimento}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nome" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Valor']}
                  />
                  <Bar dataKey="valor" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Gráfico por status */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Por Status
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.porStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, percent }) => `${getStatusLabel(status)} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="valor"
                  >
                    {stats.porStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Valor']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tabela detalhada */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Detalhamento por Estabelecimento</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estabelecimento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plantões
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Horas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.porEstabelecimento.map((estabelecimento) => (
                    <tr key={estabelecimento.nome}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {estabelecimento.nome}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {estabelecimento.total}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {Math.round(estabelecimento.horas * 100) / 100}h
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(estabelecimento.valor)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
