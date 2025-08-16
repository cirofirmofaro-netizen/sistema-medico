import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, List, DollarSign, Plus, Filter, Download } from 'lucide-react';

interface Plantao {
  id: string;
  data: string;
  inicio: string;
  fim: string;
  local: string;
  cnpj: string;
  valorPrevisto: number;
  tipoVinculo: string;
  status: 'AGENDADO' | 'REALIZADO' | 'CANCELADO' | 'TROCADO';
  fontePagadora: {
    id: string;
    nome: string;
    cnpj: string;
  };
  pagamentos: Array<{
    id: string;
    valorPago: number;
    status: 'PENDENTE' | 'PARCIAL' | 'PAGO' | 'EM_ATRASO';
  }>;
}

interface ResumoPlantoes {
  total: number;
  agendados: number;
  realizados: number;
  cancelados: number;
  trocados: number;
  valorTotalPrevisto: number;
  valorTotalRealizado: number;
  porFontePagadora: Record<string, {
    total: number;
    realizados: number;
    valorPrevisto: number;
    valorRealizado: number;
  }>;
}

const PlantoesPage: React.FC = () => {
  const [view, setView] = useState<'agenda' | 'lista' | 'financeiro'>('agenda');
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    status: '',
    fonte: '',
  });

  // Buscar plantões
  const { data: plantoes, isLoading } = useQuery({
    queryKey: ['plantoes', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);
      if (filters.status) params.append('status', filters.status);
      if (filters.fonte) params.append('fonte', filters.fonte);

      const response = await api.get(`/plantoes?${params.toString()}`);
      return response.data as Plantao[];
    },
  });

  // Buscar resumo
  const { data: resumo } = useQuery({
    queryKey: ['plantoes-resumo'],
    queryFn: async () => {
      const response = await api.get('/plantoes/resumo');
      return response.data as ResumoPlantoes;
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AGENDADO':
        return 'bg-blue-100 text-blue-800';
      case 'REALIZADO':
        return 'bg-green-100 text-green-800';
      case 'CANCELADO':
        return 'bg-red-100 text-red-800';
      case 'TROCADO':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPagamentoStatus = (plantao: Plantao) => {
    const totalPago = plantao.pagamentos.reduce((sum, pag) => sum + pag.valorPago, 0);
    const valorPrevisto = plantao.valorPrevisto;

    if (totalPago === 0) return { status: 'PENDENTE', color: 'bg-red-100 text-red-800' };
    if (totalPago < valorPrevisto) return { status: 'PARCIAL', color: 'bg-yellow-100 text-yellow-800' };
    return { status: 'PAGO', color: 'bg-green-100 text-green-800' };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDateTime = (dateTime: string) => {
    return format(new Date(dateTime), 'dd/MM/yyyy HH:mm', { locale: ptBR });
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Plantões</h1>
          <p className="text-gray-600">Gerencie seus plantões e controle financeiro</p>
        </div>
        <button className="btn btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Plantão
        </button>
      </div>

      {/* Resumo Cards */}
      {resumo && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{resumo.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Realizados</p>
                <p className="text-2xl font-bold text-gray-900">{resumo.realizados}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Previsto</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(resumo.valorTotalPrevisto)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Realizado</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(resumo.valorTotalRealizado)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">De</label>
            <input
              type="date"
              value={filters.from}
              onChange={(e) => setFilters({ ...filters, from: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Até</label>
            <input
              type="date"
              value={filters.to}
              onChange={(e) => setFilters({ ...filters, to: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="AGENDADO">Agendado</option>
              <option value="REALIZADO">Realizado</option>
              <option value="CANCELADO">Cancelado</option>
              <option value="TROCADO">Trocado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fonte Pagadora</label>
            <input
              type="text"
              placeholder="Buscar por fonte..."
              value={filters.fonte}
              onChange={(e) => setFilters({ ...filters, fonte: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Tabs de Visualização */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setView('agenda')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                view === 'agenda'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Calendar className="h-4 w-4 inline mr-2" />
              Agenda
            </button>
            <button
              onClick={() => setView('lista')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                view === 'lista'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <List className="h-4 w-4 inline mr-2" />
              Lista
            </button>
            <button
              onClick={() => setView('financeiro')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                view === 'financeiro'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <DollarSign className="h-4 w-4 inline mr-2" />
              Financeiro
            </button>
          </nav>
        </div>

        <div className="p-6">
          {view === 'agenda' && (
            <div className="space-y-4">
              {plantoes?.map((plantao) => (
                <div key={plantao.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{plantao.local}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(plantao.status)}`}>
                          {plantao.status}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPagamentoStatus(plantao).color}`}>
                          {getPagamentoStatus(plantao).status}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{plantao.fontePagadora.nome}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Data:</span>
                          <p className="text-gray-600">{formatDate(plantao.data)}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Horário:</span>
                          <p className="text-gray-600">{formatDateTime(plantao.inicio)} - {formatDateTime(plantao.fim)}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Valor:</span>
                          <p className="text-gray-600">{formatCurrency(plantao.valorPrevisto)}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Tipo:</span>
                          <p className="text-gray-600">{plantao.tipoVinculo}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="btn btn-sm btn-primary">Ver Detalhes</button>
                      <button className="btn btn-sm btn-secondary">Editar</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {view === 'lista' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Local</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fonte</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pagamento</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {plantoes?.map((plantao) => (
                    <tr key={plantao.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(plantao.data)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{plantao.local}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{plantao.fontePagadora.nome}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(plantao.valorPrevisto)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(plantao.status)}`}>
                          {plantao.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPagamentoStatus(plantao).color}`}>
                          {getPagamentoStatus(plantao).status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">Ver</button>
                        <button className="text-green-600 hover:text-green-900 mr-3">Editar</button>
                        <button className="text-red-600 hover:text-red-900">Cancelar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {view === 'financeiro' && resumo && (
            <div className="space-y-6">
              {/* Resumo por Fonte Pagadora */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Resumo por Fonte Pagadora</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fonte</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Realizados</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Previsto</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Realizado</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Object.entries(resumo.porFontePagadora).map(([fonte, dados]) => (
                        <tr key={fonte} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{fonte}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{dados.total}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{dados.realizados}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(dados.valorPrevisto)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(dados.valorRealizado)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Botão Exportar */}
              <div className="flex justify-end">
                <button className="btn btn-secondary flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Exportar CSV
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlantoesPage;
