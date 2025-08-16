import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Edit, AlertTriangle, Filter, Calendar, User } from 'lucide-react';
import { allergiesService, PatientAllergy } from '../../services/allergies';
import { AllergyForm } from './AllergyForm';
import { formatDateTime } from '../../utils/dateUtils';

interface AllergyListProps {
  patientId: string;
}

export const AllergyList: React.FC<AllergyListProps> = ({ patientId }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingAllergy, setEditingAllergy] = useState<PatientAllergy | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    severity: 'all',
    category: 'all',
  });

  const queryClient = useQueryClient();

  // Buscar alergias do paciente
  const { data: allergies = [], isLoading } = useQuery({
    queryKey: ['patient-allergies', patientId],
    queryFn: () => allergiesService.getPatientAllergies(patientId),
  });

  // Atualizar alergia
  const updateMutation = useMutation({
    mutationFn: ({ allergyId, data }: { allergyId: string; data: any }) =>
      allergiesService.updatePatientAllergy(patientId, allergyId, data),
    onSuccess: () => {
      toast.success('Alergia atualizada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['patient-allergies', patientId] });
      setShowForm(false);
      setEditingAllergy(null);
    },
    onError: () => {
      toast.error('Erro ao atualizar alergia');
    },
  });

  // Filtrar alergias
  const filteredAllergies = allergies.filter((allergy) => {
    if (filters.status !== 'all' && allergy.status !== filters.status) return false;
    if (filters.severity !== 'all' && allergy.severity !== filters.severity) return false;
    if (filters.category !== 'all' && allergy.allergen.category !== filters.category) return false;
    return true;
  });

  const handleEdit = (allergy: PatientAllergy) => {
    setEditingAllergy(allergy);
    setShowForm(true);
  };

  const handleStatusToggle = (allergy: PatientAllergy) => {
    const newStatus = allergy.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    updateMutation.mutate({
      allergyId: allergy.id,
      data: { status: newStatus },
    });
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      DRUG: 'Medicamento',
      FOOD: 'Alimento',
      ENVIRONMENT: 'Ambiente',
      CONTACT: 'Contato',
      OTHER: 'Outro',
    };
    return labels[category as keyof typeof labels] || category;
  };

  const getSeverityLabel = (severity: string) => {
    const labels = {
      MILD: 'Leve',
      MODERATE: 'Moderada',
      SEVERE: 'Grave',
      UNKNOWN: 'Desconhecida',
    };
    return labels[severity as keyof typeof labels] || severity;
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      MILD: 'bg-green-100 text-green-800',
      MODERATE: 'bg-yellow-100 text-yellow-800',
      SEVERE: 'bg-red-100 text-red-800',
      UNKNOWN: 'bg-gray-100 text-gray-800',
    };
    return colors[severity as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    return status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600';
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Alergias</h3>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Alergia
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center space-x-4">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filtros:</span>
          
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="all">Todos os status</option>
            <option value="ACTIVE">Ativas</option>
            <option value="INACTIVE">Inativas</option>
          </select>

          <select
            value={filters.severity}
            onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="all">Todas as severidades</option>
            <option value="SEVERE">Grave</option>
            <option value="MODERATE">Moderada</option>
            <option value="MILD">Leve</option>
            <option value="UNKNOWN">Desconhecida</option>
          </select>

          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="all">Todas as categorias</option>
            <option value="DRUG">Medicamento</option>
            <option value="FOOD">Alimento</option>
            <option value="ENVIRONMENT">Ambiente</option>
            <option value="CONTACT">Contato</option>
            <option value="OTHER">Outro</option>
          </select>
        </div>
      </div>

      {/* Lista */}
      {filteredAllergies.length === 0 ? (
        <div className="text-center py-8">
          <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {allergies.length === 0 ? 'Nenhuma alergia registrada' : 'Nenhuma alergia encontrada com os filtros'}
          </h3>
          <p className="text-gray-500 mb-4">
            {allergies.length === 0 
              ? 'Comece registrando as primeiras alergias do paciente.'
              : 'Tente ajustar os filtros para ver mais resultados.'
            }
          </p>
          {allergies.length === 0 && (
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary"
            >
              Registrar Primeira Alergia
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAllergies.map((allergy) => (
            <div
              key={allergy.id}
              className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {allergy.allergen.name}
                    </h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(allergy.severity)}`}>
                      {getSeverityLabel(allergy.severity)}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(allergy.status)}`}>
                      {allergy.status === 'ACTIVE' ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Categoria:</span> {getCategoryLabel(allergy.allergen.category)}
                  </div>

                  {allergy.reactions && (
                    <div className="text-sm text-gray-700 mb-2">
                      <span className="font-medium">Reações:</span> {allergy.reactions}
                    </div>
                  )}

                  {allergy.notes && (
                    <div className="text-sm text-gray-700 mb-2">
                      <span className="font-medium">Notas:</span> {allergy.notes}
                    </div>
                  )}

                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    {allergy.onsetDate && (
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Início: {new Date(allergy.onsetDate).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      Registrado por: {allergy.recordedByUser?.nome || 'N/A'}
                    </div>
                    <div>
                      Registrado em: {formatDateTime(allergy.recordedAt)}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(allergy)}
                    className="text-blue-600 hover:text-blue-900 p-1 rounded"
                    title="Editar alergia"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleStatusToggle(allergy)}
                    className={`p-1 rounded ${
                      allergy.status === 'ACTIVE' 
                        ? 'text-orange-600 hover:text-orange-900' 
                        : 'text-green-600 hover:text-green-900'
                    }`}
                    title={allergy.status === 'ACTIVE' ? 'Inativar alergia' : 'Ativar alergia'}
                  >
                    <AlertTriangle className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulário Modal */}
      {showForm && (
        <AllergyForm
          patientId={patientId}
          onSuccess={() => {
            setShowForm(false);
            setEditingAllergy(null);
            queryClient.invalidateQueries({ queryKey: ['patient-allergies', patientId] });
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingAllergy(null);
          }}
          allergy={editingAllergy || undefined}
        />
      )}
    </div>
  );
};
