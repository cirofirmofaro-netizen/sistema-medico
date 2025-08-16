import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { 
  ArrowLeft, 
  Edit, 
  DollarSign, 
  Calendar, 
  Clock, 
  MapPin, 
  Stethoscope,
  Plus,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react'
import { plantoesService, Plantao } from '../../services/plantoes'
import EditPlantaoDialog from './components/EditPlantaoDialog'
import PaymentDialog from './components/PaymentDialog'

export default function PlantaoDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)

  const { data: plantao, isLoading, error } = useQuery({
    queryKey: ['plantao', id],
    queryFn: () => plantoesService.getPlantao(id!),
    enabled: !!id
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMADO':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'CANCELADO':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'REALIZADO':
        return <CheckCircle className="h-5 w-5 text-blue-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusPagamentoColor = (status: string) => {
    switch (status) {
      case 'PAGO':
        return 'text-green-600 bg-green-100'
      case 'PARCIAL':
        return 'text-yellow-600 bg-yellow-100'
      default:
        return 'text-red-600 bg-red-100'
    }
  }

  const getStatusPagamentoText = (status: string) => {
    switch (status) {
      case 'PAGO':
        return 'Pago'
      case 'PARCIAL':
        return 'Parcialmente Pago'
      default:
        return 'Pendente'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !plantao) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Erro ao carregar plantão</p>
          <button 
            onClick={() => navigate('/plantoes')}
            className="btn btn-primary"
          >
            Voltar para Plantões
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/plantoes')}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Detalhes do Plantão</h1>
            </div>
            <button
              onClick={() => setShowEditDialog(true)}
              className="btn btn-secondary"
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informações do Plantão */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card Principal */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{plantao.local}</h2>
                  <p className="text-gray-600">{plantao.especialidade}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(plantao.status)}
                  <span className="text-sm font-medium text-gray-700">
                    {plantao.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Data</p>
                      <p className="font-medium">{new Date(plantao.data).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Horário</p>
                      <p className="font-medium">{plantao.horaInicio} - {plantao.horaFim}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Local</p>
                      <p className="font-medium">{plantao.local}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Stethoscope className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Especialidade</p>
                      <p className="font-medium">{plantao.especialidade}</p>
                    </div>
                  </div>
                </div>
              </div>

              {plantao.observacoes && (
                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm text-gray-500 mb-2">Observações</p>
                  <p className="text-gray-700">{plantao.observacoes}</p>
                </div>
              )}
            </div>

            {/* Seção de Pagamentos */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Pagamentos</h3>
                <button
                  onClick={() => setShowPaymentDialog(true)}
                  className="btn btn-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Pagamento
                </button>
              </div>

              {/* Status do Pagamento */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Status do Pagamento</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusPagamentoColor(plantao.statusPagamento)}`}>
                      {getStatusPagamentoText(plantao.statusPagamento)}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Valor Total</p>
                    <p className="text-2xl font-bold text-gray-900">
                      R$ {plantao.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-gray-500">
                      Pago: R$ {plantao.totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Lista de Pagamentos */}
              {plantao.pagamentos && plantao.pagamentos.length > 0 ? (
                <div className="space-y-3">
                  {plantao.pagamentos.map((pagamento) => (
                    <div key={pagamento.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">
                          R$ {pagamento.valorPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(pagamento.dtPgto).toLocaleDateString('pt-BR')} • {pagamento.formaPagamento}
                        </p>
                        {pagamento.obs && (
                          <p className="text-sm text-gray-600 mt-1">{pagamento.obs}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">
                          {new Date(pagamento.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum pagamento registrado</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Resumo Financeiro */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo Financeiro</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor Bruto</span>
                  <span className="font-medium">R$ {plantao.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Pago</span>
                  <span className="font-medium text-green-600">
                    R$ {plantao.totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pendente</span>
                    <span className="font-medium text-red-600">
                      R$ {(plantao.valor - plantao.totalPago).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      {showEditDialog && (
        <EditPlantaoDialog
          open={showEditDialog}
          plantao={plantao}
          onClose={() => setShowEditDialog(false)}
          onSuccess={() => {
            setShowEditDialog(false)
            queryClient.invalidateQueries({ queryKey: ['plantao', id] })
            toast.success('Plantão atualizado com sucesso!')
          }}
        />
      )}

      {showPaymentDialog && (
        <PaymentDialog
          open={showPaymentDialog}
          plantaoId={plantao.id}
          valorTotal={plantao.valor}
          onClose={() => setShowPaymentDialog(false)}
          onSuccess={() => {
            setShowPaymentDialog(false)
            queryClient.invalidateQueries({ queryKey: ['plantao', id] })
            queryClient.invalidateQueries({ queryKey: ['plantoes'] })
          }}
        />
      )}
    </div>
  )
}
