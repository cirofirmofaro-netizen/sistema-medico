import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { X, Search, AlertTriangle } from 'lucide-react';
import { allergiesService, Allergen, CreateAllergyData, UpdateAllergyData, PatientAllergy } from '../../services/allergies';

const allergySchema = z.object({
  allergenId: z.string().min(1, 'Alergeno é obrigatório'),
  severity: z.enum(['MILD', 'MODERATE', 'SEVERE', 'UNKNOWN']).optional(),
  reactions: z.string().optional(),
  onsetDate: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

type AllergyFormData = z.infer<typeof allergySchema>;

interface AllergyFormProps {
  patientId: string;
  onSuccess: () => void;
  onCancel: () => void;
  allergy?: PatientAllergy;
}

export const AllergyForm: React.FC<AllergyFormProps> = ({
  patientId,
  onSuccess,
  onCancel,
  allergy,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllergenDropdown, setShowAllergenDropdown] = useState(false);
  const [selectedAllergen, setSelectedAllergen] = useState<Allergen | null>(
    allergy ? allergy.allergen : null
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AllergyFormData>({
    resolver: zodResolver(allergySchema),
    defaultValues: {
      allergenId: allergy?.allergenId || '',
      severity: allergy?.severity || 'UNKNOWN',
      reactions: allergy?.reactions || '',
      onsetDate: allergy?.onsetDate ? allergy.onsetDate.split('T')[0] : '',
      notes: allergy?.notes || '',
      status: allergy?.status || 'ACTIVE',
    },
  });

  // Buscar alergenos
  const { data: allergens = [], isLoading: isLoadingAllergens } = useQuery({
    queryKey: ['allergens', searchQuery],
    queryFn: () => allergiesService.searchAllergens(searchQuery),
    enabled: searchQuery.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Buscar alergias existentes para validação
  const { data: existingAllergies = [] } = useQuery({
    queryKey: ['patient-allergies', patientId],
    queryFn: () => allergiesService.getPatientAllergies(patientId),
  });

  const onSubmit = async (data: AllergyFormData) => {
    try {
      if (allergy) {
        // Atualizar
        await allergiesService.updatePatientAllergy(patientId, allergy.id, data);
        toast.success('Alergia atualizada com sucesso!');
      } else {
        // Criar
        await allergiesService.createPatientAllergy(patientId, data);
        toast.success('Alergia criada com sucesso!');
      }
      onSuccess();
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Erro ao salvar alergia');
      }
    }
  };

  const handleAllergenSelect = (allergen: Allergen) => {
    setSelectedAllergen(allergen);
    setValue('allergenId', allergen.id);
    setShowAllergenDropdown(false);
    setSearchQuery(allergen.name);
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {allergy ? 'Editar Alergia' : 'Nova Alergia'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Alergeno */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alergeno *
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Digite para buscar (ex: amox, dipirona, amendoim)"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowAllergenDropdown(true);
                  if (!e.target.value) {
                    setSelectedAllergen(null);
                    setValue('allergenId', '');
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!!allergy} // Não permite editar se já existe
              />
              {isLoadingAllergens && (
                <div className="absolute right-3 top-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                </div>
              )}
              
              {showAllergenDropdown && searchQuery.length >= 2 && allergens.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {allergens.map((allergen) => (
                    <div
                      key={allergen.id}
                      onClick={() => handleAllergenSelect(allergen)}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium">{allergen.name}</div>
                      <div className="text-sm text-gray-500">
                        {getCategoryLabel(allergen.category)}
                        {allergen.synonyms.length > 0 && (
                          <span className="ml-2">
                            • Sinônimos: {allergen.synonyms.map(s => s.value).join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {errors.allergenId && (
              <p className="mt-1 text-sm text-red-600">{errors.allergenId.message}</p>
            )}
            {selectedAllergen && (
              <div className="mt-2 p-2 bg-blue-50 rounded-md">
                <div className="text-sm text-blue-800">
                  <strong>Selecionado:</strong> {selectedAllergen.name} ({getCategoryLabel(selectedAllergen.category)})
                </div>
              </div>
            )}
          </div>

          {/* Severidade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Severidade
            </label>
            <select
              {...register('severity')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="UNKNOWN">Desconhecida</option>
              <option value="MILD">Leve</option>
              <option value="MODERATE">Moderada</option>
              <option value="SEVERE">Grave</option>
            </select>
          </div>

          {/* Reações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reações
            </label>
            <textarea
              {...register('reactions')}
              placeholder="Ex: urticária, edema de glote, anafilaxia"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Data de início */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data de início
            </label>
            <input
              type="date"
              {...register('onsetDate')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas
            </label>
            <textarea
              {...register('notes')}
              placeholder="Observações adicionais"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              {...register('status')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ACTIVE">Ativa</option>
              <option value="INACTIVE">Inativa</option>
            </select>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedAllergen}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Salvando...' : allergy ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
