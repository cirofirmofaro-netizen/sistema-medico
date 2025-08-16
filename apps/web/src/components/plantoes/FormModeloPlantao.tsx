import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  DollarSign, 
  Building, 
  Repeat,
  CalendarDays,
  Trash2
} from 'lucide-react';
import { MoneyInput } from '../shared/MoneyInput';
import { modeloPlantaoSchema, type ModeloPlantaoFormData } from '../../lib/validators';
import { getRecorrenciaLabel, getWeekdayName } from '../../lib/format';
import type { FontePagadora } from '../../lib/types';

interface FormModeloPlantaoProps {
  onSubmit: (data: ModeloPlantaoFormData) => void;
  onCancel: () => void;
  fontes: FontePagadora[];
  isLoading?: boolean;
  defaultValues?: Partial<ModeloPlantaoFormData>;
  isEditing?: boolean;
}

export function FormModeloPlantao({ 
  onSubmit, 
  onCancel, 
  fontes, 
  isLoading = false,
  defaultValues,
  isEditing = false
}: FormModeloPlantaoProps) {
  const [showRecorrencia, setShowRecorrencia] = useState(defaultValues?.fixo || false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ModeloPlantaoFormData>({
    resolver: zodResolver(modeloPlantaoSchema),
    defaultValues: {
      fixo: false,
      tipoVinculo: 'CLT',
      pagador: 'HOSPITAL',
      valorPrevisto: 0,
      duracaoMin: 720, // 12 horas
      ...defaultValues,
    },
  });

  const watchedFixo = watch('fixo');
  const watchedRecorrencia = watch('recorrencia');

  // Atualizar showRecorrencia quando fixo mudar
  React.useEffect(() => {
    setShowRecorrencia(watchedFixo);
  }, [watchedFixo]);

  const handleFormSubmit = (data: ModeloPlantaoFormData) => {
    // Se não é fixo, remover dados de recorrência
    if (!data.fixo) {
      data.recorrencia = undefined;
    }
    onSubmit(data);
  };

  const toggleWeekday = (day: number) => {
    const currentRecorrencia = watchedRecorrencia || { freq: 'WEEKLY', interval: 1, byWeekday: [] };
    const currentWeekdays = currentRecorrencia.byWeekday || [];
    
    const newWeekdays = currentWeekdays.includes(day)
      ? currentWeekdays.filter(d => d !== day)
      : [...currentWeekdays, day].sort();
    
    setValue('recorrencia', {
      ...currentRecorrencia,
      byWeekday: newWeekdays,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Fonte Pagadora */}
      <div>
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

      {/* Local */}
      <div>
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

      {/* Descrição */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descrição
        </label>
        <textarea
          {...register('descricao')}
          rows={3}
          placeholder="Descrição detalhada do plantão..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Horários */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Clock className="w-4 h-4 inline mr-1" />
            Horário de Início *
          </label>
          <input
            type="time"
            {...register('inicioPadrao')}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.inicioPadrao ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.inicioPadrao && (
            <p className="mt-1 text-sm text-red-600">{errors.inicioPadrao.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Clock className="w-4 h-4 inline mr-1" />
            Horário de Fim *
          </label>
          <input
            type="time"
            {...register('fimPadrao')}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.fimPadrao ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.fimPadrao && (
            <p className="mt-1 text-sm text-red-600">{errors.fimPadrao.message}</p>
          )}
        </div>
      </div>

      {/* Duração e Valor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Duração (minutos) *
          </label>
          <input
            type="number"
            {...register('duracaoMin', { valueAsNumber: true })}
            min="30"
            max="1440"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.duracaoMin ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.duracaoMin && (
            <p className="mt-1 text-sm text-red-600">{errors.duracaoMin.message}</p>
          )}
        </div>

        <div>
          <Controller
            name="valorPrevisto"
            control={control}
            render={({ field }) => (
              <MoneyInput
                label="Valor Previsto *"
                value={field.value}
                onChange={field.onChange}
                placeholder="0,00"
                error={errors.valorPrevisto?.message}
              />
            )}
          />
        </div>
      </div>

      {/* Tipo de Vínculo e Pagador */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pagador *
          </label>
          <select
            {...register('pagador')}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.pagador ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="HOSPITAL">Hospital</option>
            <option value="PLANTONISTA">Plantonista</option>
          </select>
          {errors.pagador && (
            <p className="mt-1 text-sm text-red-600">{errors.pagador.message}</p>
          )}
        </div>
      </div>

      {/* Plantão Fixo */}
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="fixo"
          {...register('fixo')}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="fixo" className="text-sm font-medium text-gray-700">
          <Repeat className="w-4 h-4 inline mr-1" />
          Plantão fixo (recorrente)
        </label>
      </div>

      {/* Configuração de Recorrência */}
      {showRecorrencia && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            <CalendarDays className="w-4 h-4 inline mr-1" />
            Configuração de Recorrência
          </h4>
          
          <div className="space-y-4">
            {/* Frequência */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frequência *
              </label>
              <select
                {...register('recorrencia.freq')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="WEEKLY">Semanal</option>
                <option value="BIWEEKLY">Quinzenal</option>
                <option value="MONTHLY">Mensal</option>
              </select>
            </div>

            {/* Intervalo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Intervalo *
              </label>
              <input
                type="number"
                {...register('recorrencia.interval', { valueAsNumber: true })}
                min="1"
                defaultValue="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Dias da semana (apenas para frequência semanal) */}
            {watchedRecorrencia?.freq === 'WEEKLY' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dias da semana
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                    const isSelected = watchedRecorrencia?.byWeekday?.includes(day) || false;
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleWeekday(day)}
                        className={`
                          p-2 text-xs font-medium rounded-lg border transition-colors
                          ${isSelected
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }
                        `}
                      >
                        {getWeekdayName(day).slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
                {watchedRecorrencia?.byWeekday && watchedRecorrencia.byWeekday.length > 0 && (
                  <p className="mt-2 text-sm text-gray-600">
                    {getRecorrenciaLabel(watchedRecorrencia)}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Observações */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Observações
        </label>
        <textarea
          {...register('observacoes')}
          rows={3}
          placeholder="Observações adicionais..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {isEditing ? 'Salvando...' : 'Criando...'}
            </div>
          ) : (
            isEditing ? 'Salvar Modelo' : 'Criar Modelo'
          )}
        </button>
      </div>
    </form>
  );
}
