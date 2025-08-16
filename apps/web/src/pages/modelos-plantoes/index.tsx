import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Repeat,
  MoreHorizontal,
  Edit,
  Trash2,
  Play,
  Building
} from 'lucide-react';
import { useModelos, useCreateModelo, useUpdateModelo, useDeleteModelo, useGerarOcorrencias } from '../../lib/hooks/useModelos';
import { useFontesAtivas } from '../../lib/hooks/useFontes';
import { EmptyState } from '../../components/shared/EmptyState';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { FormModeloPlantao } from '../../components/plantoes/FormModeloPlantao';
import { GerarOcorrenciasModal } from '../../components/plantoes/GerarOcorrenciasModal';
import { formatMoney, getRecorrenciaLabel, getTipoVinculoLabel, getPagadorLabel } from '../../lib/format';
import type { ModeloPlantao, ModeloPlantaoFormData, GerarOcorrenciasFormData } from '../../lib/types';

export default function ModelosPlantoesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showGerarOcorrenciasModal, setShowGerarOcorrenciasModal] = useState(false);
  const [selectedModelo, setSelectedModelo] = useState<ModeloPlantao | null>(null);
  const [filtroFonte, setFiltroFonte] = useState('');

  // Hooks
  const { data: modelos, isLoading } = useModelos();
  const { data: fontes } = useFontesAtivas();
  const createModelo = useCreateModelo();
  const updateModelo = useUpdateModelo();
  const deleteModelo = useDeleteModelo();
  const gerarOcorrencias = useGerarOcorrencias();

  // Filtrar modelos
  const filteredModelos = modelos?.filter(modelo => {
    const matchesSearch = !searchTerm || 
      modelo.local.toLowerCase().includes(searchTerm.toLowerCase()) ||
      modelo.fontePagadora?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      modelo.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFonte = !filtroFonte || modelo.fontePagadoraId === filtroFonte;
    
    return matchesSearch && matchesFonte;
  }) || [];

  // Handlers
  const handleCreate = async (data: ModeloPlantaoFormData) => {
    try {
      await createModelo.mutateAsync(data);
      setShowCreateModal(false);
    } catch (error) {
      // Erro já tratado pelo hook
    }
  };

  const handleEdit = async (data: ModeloPlantaoFormData) => {
    if (!selectedModelo) return;
    
    try {
      await updateModelo.mutateAsync({ id: selectedModelo.id, data });
      setShowEditModal(false);
      setSelectedModelo(null);
    } catch (error) {
      // Erro já tratado pelo hook
    }
  };

  const handleDelete = async () => {
    if (!selectedModelo) return;
    
    try {
      await deleteModelo.mutateAsync(selectedModelo.id);
      setShowDeleteConfirm(false);
      setSelectedModelo(null);
    } catch (error) {
      // Erro já tratado pelo hook
    }
  };

  const handleGerarOcorrencias = async (data: GerarOcorrenciasFormData) => {
    if (!selectedModelo) return;
    
    try {
      await gerarOcorrencias.mutateAsync({ 
        id: selectedModelo.id, 
        start: data.start, 
        end: data.end 
      });
      setShowGerarOcorrenciasModal(false);
      setSelectedModelo(null);
    } catch (error) {
      // Erro já tratado pelo hook
    }
  };

  const openEditModal = (modelo: ModeloPlantao) => {
    setSelectedModelo(modelo);
    setShowEditModal(true);
  };

  const openDeleteConfirm = (modelo: ModeloPlantao) => {
    setSelectedModelo(modelo);
    setShowDeleteConfirm(true);
  };

  const openGerarOcorrenciasModal = (modelo: ModeloPlantao) => {
    setSelectedModelo(modelo);
    setShowGerarOcorrenciasModal(true);
  };

  if (isLoading) {
    return <ModelosSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Modelos de Plantão</h1>
              <p className="text-gray-600">Gerencie modelos para criar plantões recorrentes</p>
            </div>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Modelo
            </button>
          </div>

          {/* Filtros */}
          <div className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Filter className="w-4 h-4 mr-1" />
                  Filtros
                </button>
              </div>
            </div>

            {/* Barra de busca */}
            <div className="mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por local, fonte pagadora ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Filtros expandidos */}
            {showFilters && (
              <div className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fonte Pagadora
                    </label>
                    <select
                      value={filtroFonte}
                      onChange={(e) => setFiltroFonte(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Todas</option>
                      {fontes?.map(fonte => (
                        <option key={fonte.id} value={fonte.id}>
                          {fonte.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredModelos.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="Nenhum modelo encontrado"
            description={searchTerm || filtroFonte 
              ? "Não há modelos que correspondam aos filtros aplicados."
              : "Você ainda não tem modelos de plantão. Crie um novo modelo para começar."
            }
            action={{
              label: "Criar Modelo",
              onClick: () => setShowCreateModal(true),
              variant: "primary"
            }}
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredModelos.map((modelo) => (
              <ModeloCard
                key={modelo.id}
                modelo={modelo}
                onEdit={openEditModal}
                onDelete={openDeleteConfirm}
                onGerarOcorrencias={openGerarOcorrenciasModal}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Novo Modelo de Plantão</h3>
              </div>
              <div className="px-6 py-4">
                <FormModeloPlantao
                  onSubmit={handleCreate}
                  onCancel={() => setShowCreateModal(false)}
                  fontes={fontes || []}
                  isLoading={createModelo.isPending}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedModelo && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Editar Modelo de Plantão</h3>
              </div>
              <div className="px-6 py-4">
                <FormModeloPlantao
                  onSubmit={handleEdit}
                  onCancel={() => {
                    setShowEditModal(false);
                    setSelectedModelo(null);
                  }}
                  fontes={fontes || []}
                  isLoading={updateModelo.isPending}
                  defaultValues={selectedModelo}
                  isEditing={true}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmação de exclusão */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setSelectedModelo(null);
        }}
        onConfirm={handleDelete}
        title="Confirmar exclusão"
        message={`Tem certeza que deseja excluir o modelo "${selectedModelo?.local}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        variant="danger"
        isLoading={deleteModelo.isPending}
      />

      {/* Modal de gerar ocorrências */}
      {showGerarOcorrenciasModal && selectedModelo && (
        <GerarOcorrenciasModal
          isOpen={showGerarOcorrenciasModal}
          onClose={() => {
            setShowGerarOcorrenciasModal(false);
            setSelectedModelo(null);
          }}
          onConfirm={handleGerarOcorrencias}
          modelo={selectedModelo}
          isLoading={gerarOcorrencias.isPending}
        />
      )}
    </div>
  );
}

// Componente Card do Modelo
function ModeloCard({ 
  modelo, 
  onEdit, 
  onDelete, 
  onGerarOcorrencias 
}: { 
  modelo: ModeloPlantao; 
  onEdit: (modelo: ModeloPlantao) => void;
  onDelete: (modelo: ModeloPlantao) => void;
  onGerarOcorrencias: (modelo: ModeloPlantao) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-sm border hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-900 truncate">
              {modelo.local}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Badge de recorrência */}
            {modelo.fixo && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <Repeat className="w-3 h-3 mr-1" />
                FIXO
              </span>
            )}
            
            {/* Menu de ações */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <MoreHorizontal className="w-4 h-4 text-gray-500" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border z-10">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        onEdit(modelo);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                    >
                      <Edit className="w-4 h-4 mr-2 text-blue-600" />
                      Editar modelo
                    </button>
                    
                    {modelo.fixo && (
                      <button
                        onClick={() => {
                          onGerarOcorrencias(modelo);
                          setShowMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                      >
                        <Play className="w-4 h-4 mr-2 text-green-600" />
                        Gerar ocorrências
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        onDelete(modelo);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                    >
                      <Trash2 className="w-4 h-4 mr-2 text-red-600" />
                      Excluir modelo
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Fonte Pagadora */}
        <div className="flex items-start space-x-2">
          <Building className="w-4 h-4 text-gray-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-900">{modelo.fontePagadora?.nome}</p>
            <p className="text-xs text-gray-600">{modelo.fontePagadora?.cnpj}</p>
          </div>
        </div>

        {/* Horário */}
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-700">
            {modelo.inicioPadrao} - {modelo.fimPadrao}
          </span>
        </div>

        {/* Recorrência */}
        {modelo.recorrencia && (
          <div className="flex items-center space-x-2">
            <Repeat className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">
              {getRecorrenciaLabel(modelo.recorrencia)}
            </span>
          </div>
        )}

        {/* Tipo e Pagador */}
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>{getTipoVinculoLabel(modelo.tipoVinculo)}</span>
          <span>{getPagadorLabel(modelo.pagador)}</span>
        </div>

        {/* Valor */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-900">
              {formatMoney(modelo.valorPrevisto)}
            </span>
          </div>
        </div>

        {/* Descrição */}
        {modelo.descricao && (
          <div className="text-xs text-gray-600 pt-2 border-t border-gray-100">
            {modelo.descricao}
          </div>
        )}
      </div>
    </div>
  );
}

// Skeleton
function ModelosSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border animate-pulse">
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-48"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
