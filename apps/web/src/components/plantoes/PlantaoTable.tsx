import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  DollarSign, 
  MoreHorizontal,
  Download,
  Eye,
  Clock
} from 'lucide-react';
import { formatDate, formatTime, formatMoney, getStatusColor, getStatusLabel, formatCNPJ } from '../../lib/format';
import { EmptyState } from '../shared/EmptyState';
import type { Plantao, PlantaoFilters, FontePagadora } from '../../lib/types';

interface PlantaoTableProps {
  plantoes: Plantao[];
  filters: PlantaoFilters;
  onFilterChange: (filters: Partial<PlantaoFilters>) => void;
  fontes: FontePagadora[];
  onPagamento?: (plantao: Plantao) => void;
  onTroca?: (plantao: Plantao) => void;
  onAnexos?: (plantao: Plantao) => void;
}

export function PlantaoTable({ 
  plantoes, 
  filters, 
  onFilterChange, 
  fontes,
  onPagamento,
  onTroca,
  onAnexos
}: PlantaoTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Filtrar plantões baseado no termo de busca
  const filteredPlantoes = plantoes.filter(plantao => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      plantao.local.toLowerCase().includes(searchLower) ||
      plantao.fontePagadora?.nome.toLowerCase().includes(searchLower) ||
      plantao.cnpj.includes(searchTerm) ||
      formatDate(plantao.data).includes(searchTerm)
    );
  });

  const handleExportCSV = () => {
    const headers = [
      'Data',
      'Local',
      'Fonte Pagadora',
      'CNPJ',
      'Início',
      'Fim',
      'Valor Previsto',
      'Status',
      'Status Pagamento'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredPlantoes.map(plantao => [
        formatDate(plantao.data),
        `"${plantao.local}"`,
        `"${plantao.fontePagadora?.nome || ''}"`,
        plantao.cnpj,
        plantao.inicio,
        plantao.fim,
        plantao.valorPrevisto,
        plantao.status,
        getPagamentoStatus(plantao).status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `plantoes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getPagamentoStatus = (plantao: Plantao) => {
    if (!plantao.pagamentos || plantao.pagamentos.length === 0) {
      return { status: 'PENDENTE', valorPago: 0 };
    }

    const totalPago = plantao.pagamentos.reduce((sum, pag) => sum + pag.valorPago, 0);
    const valorPrevisto = plantao.valorPrevisto;

    if (totalPago >= valorPrevisto) {
      return { status: 'PAGO', valorPago: totalPago };
    } else if (totalPago > 0) {
      return { status: 'PARCIAL', valorPago: totalPago };
    } else {
      return { status: 'PENDENTE', valorPago: 0 };
    }
  };

  if (plantoes.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title="Nenhum plantão encontrado"
        description="Não há plantões que correspondam aos filtros aplicados."
        action={{
          label: "Limpar filtros",
          onClick: () => onFilterChange({}),
          variant: "outline"
        }}
      />
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border">
      {/* Header com filtros */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Plantões ({filteredPlantoes.length})
            </h3>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Filter className="w-4 h-4 mr-1" />
              Filtros
            </button>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Download className="w-4 h-4 mr-1" />
              Exportar CSV
            </button>
          </div>
        </div>

        {/* Barra de busca */}
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por local, fonte pagadora, CNPJ ou data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Filtros expandidos */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data inicial
              </label>
              <input
                type="date"
                value={filters.from || ''}
                onChange={(e) => onFilterChange({ from: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data final
              </label>
              <input
                type="date"
                value={filters.to || ''}
                onChange={(e) => onFilterChange({ to: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) => onFilterChange({ status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos</option>
                <option value="AGENDADO">Agendado</option>
                <option value="REALIZADO">Realizado</option>
                <option value="CANCELADO">Cancelado</option>
                <option value="TROCADO">Trocado</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fonte Pagadora
              </label>
              <select
                value={filters.fontePagadoraId || ''}
                onChange={(e) => onFilterChange({ fontePagadoraId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todas</option>
                {fontes.map(fonte => (
                  <option key={fonte.id} value={fonte.id}>
                    {fonte.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Local
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fonte Pagadora
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Horário
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pagamento
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPlantoes.map((plantao) => {
              const pagamentoInfo = getPagamentoStatus(plantao);
              
              return (
                <tr key={plantao.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(plantao.data)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {plantao.local}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatCNPJ(plantao.cnpj)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {plantao.fontePagadora?.nome}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-gray-400 mr-2" />
                      {formatTime(plantao.inicio)} - {formatTime(plantao.fim)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 text-gray-400 mr-2" />
                      {formatMoney(plantao.valorPrevisto)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(plantao.status)}`}>
                      {getStatusLabel(plantao.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(pagamentoInfo.status)}`}>
                      {getStatusLabel(pagamentoInfo.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => onPagamento?.(plantao)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Registrar pagamento"
                      >
                        <DollarSign className="w-4 h-4" />
                      </button>
                      
                      {plantao.status === 'AGENDADO' && (
                        <button
                          onClick={() => onTroca?.(plantao)}
                          className="text-amber-600 hover:text-amber-900"
                          title="Trocar plantão"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => onAnexos?.(plantao)}
                        className="text-gray-600 hover:text-gray-900"
                        title="Ver anexos"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
