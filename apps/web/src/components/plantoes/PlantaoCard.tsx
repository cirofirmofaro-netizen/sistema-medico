import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  ArrowRightLeft,
  MoreVertical,
  FileText
} from 'lucide-react';
import { formatDate, formatTime, formatMoney, getStatusColor, getStatusLabel, formatCNPJ } from '../../lib/format';
import { useRealizarPlantao, useCancelarPlantao } from '../../lib/hooks/usePlantoes';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import type { Plantao } from '../../lib/types';

interface PlantaoCardProps {
  plantao: Plantao;
  onPagamento?: (plantao: Plantao) => void;
  onTroca?: (plantao: Plantao) => void;
  onAnexos?: (plantao: Plantao) => void;
}

export function PlantaoCard({ plantao, onPagamento, onTroca, onAnexos }: PlantaoCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showConfirmRealizar, setShowConfirmRealizar] = useState(false);
  const [showConfirmCancelar, setShowConfirmCancelar] = useState(false);

  const realizarPlantao = useRealizarPlantao();
  const cancelarPlantao = useCancelarPlantao();

  const handleRealizar = () => {
    realizarPlantao.mutate(plantao.id);
    setShowConfirmRealizar(false);
  };

  const handleCancelar = () => {
    cancelarPlantao.mutate(plantao.id);
    setShowConfirmCancelar(false);
  };

  // Calcular status de pagamento
  const getPagamentoStatus = () => {
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

  const pagamentoInfo = getPagamentoStatus();

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-900">
                {formatDate(plantao.data)}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Badge de troca */}
              {plantao.ehTroca && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                  <ArrowRightLeft className="w-3 h-3 mr-1" />
                  TROCA
                </span>
              )}
              
              {/* Status do plantão */}
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(plantao.status)}`}>
                {getStatusLabel(plantao.status)}
              </span>
              
              {/* Menu de ações */}
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <MoreVertical className="w-4 h-4 text-gray-500" />
                </button>
                
                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border z-10">
                    <div className="py-1">
                      {plantao.status === 'AGENDADO' && (
                        <>
                          <button
                            onClick={() => {
                              setShowConfirmRealizar(true);
                              setShowMenu(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                          >
                            <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                            Marcar como realizado
                          </button>
                          
                          <button
                            onClick={() => {
                              setShowConfirmCancelar(true);
                              setShowMenu(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                          >
                            <XCircle className="w-4 h-4 mr-2 text-red-600" />
                            Cancelar plantão
                          </button>
                        </>
                      )}
                      
                      <button
                        onClick={() => {
                          onPagamento?.(plantao);
                          setShowMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                      >
                        <DollarSign className="w-4 h-4 mr-2 text-blue-600" />
                        Registrar pagamento
                      </button>
                      
                      {plantao.status === 'AGENDADO' && (
                        <button
                          onClick={() => {
                            onTroca?.(plantao);
                            setShowMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                        >
                          <ArrowRightLeft className="w-4 h-4 mr-2 text-amber-600" />
                          Trocar plantão
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          onAnexos?.(plantao);
                          setShowMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                      >
                        <FileText className="w-4 h-4 mr-2 text-gray-600" />
                        Anexos
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
          {/* Local */}
          <div className="flex items-start space-x-2">
            <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">{plantao.local}</p>
              <p className="text-xs text-gray-600">{plantao.fontePagadora?.nome}</p>
            </div>
          </div>

          {/* Horário */}
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">
              {formatTime(plantao.inicio)} - {formatTime(plantao.fim)}
            </span>
          </div>

          {/* CNPJ */}
          <div className="text-xs text-gray-600">
            CNPJ: {formatCNPJ(plantao.cnpj)}
          </div>

          {/* Valor e Status de Pagamento */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-900">
                {formatMoney(plantao.valorPrevisto)}
              </span>
            </div>
            
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(pagamentoInfo.status)}`}>
              {getStatusLabel(pagamentoInfo.status)}
            </span>
          </div>

          {/* Informações de troca */}
          {plantao.ehTroca && (
            <div className="mt-2 p-2 bg-amber-50 rounded-lg">
              <p className="text-xs text-amber-800">
                <strong>Trocado com:</strong> {plantao.trocaCom}
              </p>
              {plantao.motivoTroca && (
                <p className="text-xs text-amber-700 mt-1">
                  <strong>Motivo:</strong> {plantao.motivoTroca}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirmação de realizar */}
      <ConfirmDialog
        isOpen={showConfirmRealizar}
        onClose={() => setShowConfirmRealizar(false)}
        onConfirm={handleRealizar}
        title="Confirmar realização"
        message={`Tem certeza que deseja marcar o plantão de ${formatDate(plantao.data)} como realizado?`}
        confirmText="Confirmar"
        variant="info"
        isLoading={realizarPlantao.isPending}
      />

      {/* Confirmação de cancelar */}
      <ConfirmDialog
        isOpen={showConfirmCancelar}
        onClose={() => setShowConfirmCancelar(false)}
        onConfirm={handleCancelar}
        title="Confirmar cancelamento"
        message={`Tem certeza que deseja cancelar o plantão de ${formatDate(plantao.data)}?`}
        confirmText="Cancelar"
        variant="danger"
        isLoading={cancelarPlantao.isPending}
      />
    </>
  );
}
