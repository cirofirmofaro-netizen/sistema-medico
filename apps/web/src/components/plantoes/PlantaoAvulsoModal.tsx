import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Calendar, Clock, MapPin, DollarSign, Building } from 'lucide-react';
import { useCreatePlantaoAvulso } from '../../lib/hooks/usePlantoes';
import { MoneyInput } from '../shared/MoneyInput';
import { plantaoAvulsoSchema, type PlantaoAvulsoFormData } from '../../lib/validators';
import type { FontePagadora } from '../../lib/types';

interface PlantaoAvulsoModalProps {
  isOpen: boolean;
  onClose: () => void;
  fontes: FontePagadora[];
}

export function PlantaoAvulsoModal({ isOpen, onClose, fontes }: PlantaoAvulsoModalProps) {
  const createPlantao = useCreatePlantaoAvulso();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<PlantaoAvulsoFormData>({
    resolver: zodResolver(plantaoAvulsoSchema),
    defaultValues: {
      data: new Date().toISOString().split('T')[0],
      inicio: '19:00',
      fim: '07:00',
      valorPrevisto: 0,
      tipoVinculo: 'CLT',
    },
  });

  const selectedFonteId = watch('fontePagadoraId');
  const selectedFonte = fontes.find(f => f.id === selectedFonteId);

  const onSubmit = async (data: PlantaoAvulsoFormData) => {
    try {
      await createPlantao.mutateAsync(data);
      reset();
      onClose();
    } catch (error) {
      // Erro já tratado pelo hook
    }
  };

  const handleClose = () => {
    if (!createPlantao.isPending) {
      reset();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={handleClose}
        />
        
        {/* Modal */}
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Novo Plantão Avulso
              </h3>
              <button
                onClick={handleClose}
                disabled={createPlantao.isPending}
                className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Fonte Pagadora */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Building className="w-4 h-4 inline mr-1" />
                  Fonte Pagadora *
                </label>
                <select
                  {...register('fontePagadoraId')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.fontePagadoraId ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Selecione uma fonte pagadora</option>
                  {fontes.map(fonte => (
                    <option key={fonte.id} value={fonte.id}>
                      {fonte.nome} - {fonte.cnpj}
                    </option>
                  ))}
                </select>
                {errors.fontePagadoraId && (
                  <p className="mt-1 text-sm text-red-600">{errors.fontePagadoraId.message}</p>
                )}
              </div>

              {/* Data */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Data *
                </label>
                <input
                  type="date"
                  {...register('data')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.data ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.data && (
                  <p className="mt-1 text-sm text-red-600">{errors.data.message}</p>
                )}
              </div>

              {/* Tipo de Vínculo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Vínculo *
                </label>
                <select
                  {...register('tipoVinculo')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.tipoVinculo ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="CLT">CLT</option>
                  <option value="RPA">RPA</option>
                  <option value="PJ">PJ</option>
                  <option value="COOPERATIVA">Cooperativa</option>
                  <option value="AUTONOMO">Autônomo</option>
                </select>
                {errors.tipoVinculo && (
                  <p className="mt-1 text-sm text-red-600">{errors.tipoVinculo.message}</p>
                )}
              </div>

              {/* Horário de Início */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Horário de Início *
                </label>
                <input
                  type="time"
                  {...register('inicio')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.inicio ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.inicio && (
                  <p className="mt-1 text-sm text-red-600">{errors.inicio.message}</p>
                )}
              </div>

              {/* Horário de Fim */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Horário de Fim *
                </label>
                <input
                  type="time"
                  {...register('fim')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.fim ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.fim && (
                  <p className="mt-1 text-sm text-red-600">{errors.fim.message}</p>
                )}
              </div>

              {/* Local */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Local *
                </label>
                <input
                  type="text"
                  {...register('local')}
                  placeholder="Ex: UTI - Hospital Alfa"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.local ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.local && (
                  <p className="mt-1 text-sm text-red-600">{errors.local.message}</p>
                )}
              </div>

              {/* CNPJ */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CNPJ *
                </label>
                <input
                  type="text"
                  {...register('cnpj')}
                  placeholder="00.000.000/0000-00"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.cnpj ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.cnpj && (
                  <p className="mt-1 text-sm text-red-600">{errors.cnpj.message}</p>
                )}
                {selectedFonte && (
                  <p className="mt-1 text-sm text-gray-500">
                    CNPJ da fonte: {selectedFonte.cnpj}
                  </p>
                )}
              </div>

              {/* Valor Previsto */}
              <div className="md:col-span-2">
                <MoneyInput
                  label="Valor Previsto *"
                  value={watch('valorPrevisto')}
                  onChange={(value) => setValue('valorPrevisto', value)}
                  placeholder="0,00"
                  error={errors.valorPrevisto?.message}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={createPlantao.isPending}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={createPlantao.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createPlantao.isPending ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Criando...
                  </div>
                ) : (
                  'Criar Plantão'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
