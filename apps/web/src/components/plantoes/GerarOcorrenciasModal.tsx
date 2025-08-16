import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Calendar, AlertTriangle } from 'lucide-react';
import { gerarOcorrenciasSchema, type GerarOcorrenciasFormData } from '../../lib/validators';
import type { ModeloPlantao } from '../../lib/types';

interface GerarOcorrenciasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: GerarOcorrenciasFormData) => void;
  modelo: ModeloPlantao;
  isLoading?: boolean;
}

export function GerarOcorrenciasModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  modelo, 
  isLoading = false 
}: GerarOcorrenciasModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<GerarOcorrenciasFormData>({
    resolver: zodResolver(gerarOcorrenciasSchema),
    defaultValues: {
      start: new Date().toISOString().split('T')[0],
      end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 dias
    },
  });

  const handleFormSubmit = (data: GerarOcorrenciasFormData) => {
    onConfirm(data);
    reset();
  };

  const handleClose = () => {
    if (!isLoading) {
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
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Gerar Ocorrências
              </h3>
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="px-6 py-4">
            {/* Info do modelo */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                Modelo: {modelo.local}
              </h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p><strong>Fonte:</strong> {modelo.fontePagadora?.nome}</p>
                <p><strong>Horário:</strong> {modelo.inicioPadrao} - {modelo.fimPadrao}</p>
                <p><strong>Valor:</strong> R$ {modelo.valorPrevisto.toFixed(2)}</p>
                {modelo.recorrencia && (
                  <p><strong>Recorrência:</strong> {modelo.recorrencia.freq === 'WEEKLY' ? 'Semanal' : modelo.recorrencia.freq === 'BIWEEKLY' ? 'Quinzenal' : 'Mensal'}</p>
                )}
              </div>
            </div>

            {/* Warning */}
            <div className="mb-6 p-4 bg-amber-50 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-1">Atenção!</p>
                  <p>Esta ação irá gerar plantões recorrentes baseados no modelo selecionado. Os plantões serão criados automaticamente para o período especificado.</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Data Inicial *
                </label>
                <input
                  type="date"
                  {...register('start')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.start ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.start && (
                  <p className="mt-1 text-sm text-red-600">{errors.start.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Data Final *
                </label>
                <input
                  type="date"
                  {...register('end')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.end ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.end && (
                  <p className="mt-1 text-sm text-red-600">{errors.end.message}</p>
                )}
              </div>
            </form>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              onClick={handleSubmit(handleFormSubmit)}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Gerando...
                </div>
              ) : (
                'Gerar Ocorrências'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
