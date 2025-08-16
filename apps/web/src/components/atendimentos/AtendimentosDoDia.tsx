import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Calendar, Clock, Lock, CheckCircle, AlertCircle, Stethoscope, Activity, AlertTriangle } from 'lucide-react';
import { atendimentosService, Atendimento } from '../../services/atendimentos';
import { conditionsService } from '../../services/conditions';
import { formatDateTime } from '../../utils/dateUtils';

interface AtendimentosDoDiaProps {
  patientId: string;
}

export const AtendimentosDoDia: React.FC<AtendimentosDoDiaProps> = ({ patientId }) => {
  const [selectedAtendimento, setSelectedAtendimento] = useState<Atendimento | null>(null);
  const queryClient = useQueryClient();

  // Buscar atendimentos
  const { data: atendimentos, isLoading } = useQuery({
    queryKey: ['atendimentos', patientId],
    queryFn: () => atendimentosService.listPatientAtendimentos(patientId),
  });

  // Finalizar atendimento
  const finalizarMutation = useMutation({
    mutationFn: (atendimentoId: string) => atendimentosService.finalizarAtendimento(atendimentoId),
    onSuccess: () => {
      toast.success('Atendimento finalizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['atendimentos', patientId] });
    },
    onError: () => {
      toast.error('Erro ao finalizar atendimento');
    },
  });

  const handleFinalizar = (atendimentoId: string) => {
    if (confirm('Tem certeza que deseja finalizar este atendimento? Esta ação não pode ser desfeita.')) {
      finalizarMutation.mutate(atendimentoId);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'FINALIZADO':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'EM_ANDAMENTO':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'CANCELADO':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'FINALIZADO':
        return 'Finalizado';
      case 'EM_ANDAMENTO':
        return 'Em Andamento';
      case 'CANCELADO':
        return 'Cancelado';
      default:
        return status;
    }
  };

  // Função para extrair diagnóstico das evoluções
  const extractDiagnostico = (evolucoes: Array<{ texto: string; resumo?: string }>) => {
    // Buscar por padrões comuns de diagnóstico nas evoluções
    const diagnosticos = evolucoes
      .map(evolucao => {
        const texto = evolucao.texto.toLowerCase();
        const resumo = evolucao.resumo?.toLowerCase() || '';
        
        // Padrões comuns para identificar diagnósticos
        const diagnosticPatterns = [
          /diagnóstico[:\s]+([^.\n]+)/i,
          /dx[:\s]+([^.\n]+)/i,
          /impressão diagnóstica[:\s]+([^.\n]+)/i,
          /hipótese diagnóstica[:\s]+([^.\n]+)/i,
          /diagnóstico principal[:\s]+([^.\n]+)/i,
          /diagnóstico secundário[:\s]+([^.\n]+)/i,
        ];
        
        for (const pattern of diagnosticPatterns) {
          const match = texto.match(pattern) || resumo.match(pattern);
          if (match && match[1]) {
            return match[1].trim();
          }
        }
        
        return null;
      })
      .filter(Boolean);
    
    return diagnosticos.length > 0 ? diagnosticos[0] : null;
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

  if (!atendimentos || atendimentos.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum atendimento encontrado</h3>
        <p className="text-gray-500">Este paciente ainda não possui atendimentos registrados.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Atendimentos do Dia</h3>
        <div className="text-sm text-gray-500">
          {atendimentos.length} atendimento{atendimentos.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="space-y-4">
        {atendimentos.map((atendimento) => {
          const diagnostico = extractDiagnostico(atendimento.evolucoes);
          
          return (
            <div
              key={atendimento.id}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedAtendimento?.id === atendimento.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedAtendimento(
                selectedAtendimento?.id === atendimento.id ? null : atendimento
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <div>
                    <div className="font-medium text-gray-900">
                      {new Date(atendimento.serviceDate).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDateTime(atendimento.startedAt)}
                      {atendimento.finishedAt && ` - ${formatDateTime(atendimento.finishedAt)}`}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {getStatusIcon(atendimento.status)}
                  <span className={`text-sm font-medium ${
                    atendimento.status === 'FINALIZADO' ? 'text-green-600' :
                    atendimento.status === 'EM_ANDAMENTO' ? 'text-blue-600' :
                    'text-red-600'
                  }`}>
                    {getStatusLabel(atendimento.status)}
                  </span>
                  
                  {atendimento.status === 'FINALIZADO' && (
                    <Lock className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                <span>Dr. {atendimento.profissional.nome}</span>
                <div className="flex items-center space-x-4">
                  <span>{atendimento.evolucoes.length} evolução{atendimento.evolucoes.length !== 1 ? 'ões' : ''}</span>
                  <span>{atendimento.sinaisVitais.length} sinais vitais</span>
                  <span>{atendimento.anexos.length} anexo{atendimento.anexos.length !== 1 ? 's' : ''}</span>
                </div>
              </div>

              {/* Diagnóstico do atendimento */}
              {diagnostico && (
                <div className="flex items-center space-x-2 mb-3 p-2 bg-blue-50 rounded-md">
                  <Stethoscope className="w-4 h-4 text-blue-600" />
                  <div>
                    <span className="text-sm font-medium text-blue-800">Diagnóstico:</span>
                    <span className="text-sm text-blue-700 ml-1">{diagnostico}</span>
                  </div>
                </div>
              )}

              {atendimento.status === 'EM_ANDAMENTO' && (
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFinalizar(atendimento.id);
                    }}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    Finalizar Atendimento
                  </button>
                </div>
              )}

              {/* Conteúdo expandido */}
              {selectedAtendimento?.id === atendimento.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <AtendimentoContent atendimento={atendimento} patientId={patientId} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Componente para exibir o conteúdo do atendimento
const AtendimentoContent: React.FC<{ atendimento: Atendimento; patientId: string }> = ({ 
  atendimento, patientId 
}) => {
  const [activeTab, setActiveTab] = useState<'evolucoes' | 'sinais-vitais' | 'anexos'>('evolucoes');

  // Query para buscar condições do paciente
  const { data: conditions = [], isLoading: loadingConditions } = useQuery({
    queryKey: ['patient-conditions', patientId],
    queryFn: () => conditionsService.getPatientConditions(patientId),
    enabled: !!patientId
  });

  const tabs = [
    { id: 'evolucoes', label: 'Evoluções', count: atendimento.evolucoes.length },
    { id: 'sinais-vitais', label: 'Sinais Vitais', count: atendimento.sinaisVitais.length },
    { id: 'anexos', label: 'Anexos', count: atendimento.anexos.length },
  ] as const;

  return (
    <div>
      {/* Resumo Detalhado do Atendimento */}
      <div className="mb-6 space-y-4">
        {/* Texto da Evolução */}
        {atendimento.evolucoes.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Stethoscope className="h-4 w-4 mr-2 text-blue-600" />
              Evolução:
            </h4>
            <div className="bg-white rounded-lg p-3 border">
              <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                {atendimento.evolucoes[0].texto}
              </p>
            </div>
          </div>
        )}

        {/* Sinais Vitais */}
        {atendimento.sinaisVitais.length > 0 && (
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Activity className="h-4 w-4 mr-2 text-green-600" />
              Sinais Vitais:
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {atendimento.sinaisVitais[0] && (
                <>
                  {atendimento.sinaisVitais[0].pressaoSistolica && atendimento.sinaisVitais[0].pressaoDiastolica && (
                    <div className="bg-white rounded-lg p-2 border text-center">
                      <p className="text-xs text-gray-500">PA</p>
                      <p className="text-sm font-medium text-gray-900">
                        {atendimento.sinaisVitais[0].pressaoSistolica}/{atendimento.sinaisVitais[0].pressaoDiastolica} mmHg
                      </p>
                    </div>
                  )}
                  {atendimento.sinaisVitais[0].frequenciaCardiaca && (
                    <div className="bg-white rounded-lg p-2 border text-center">
                      <p className="text-xs text-gray-500">FC</p>
                      <p className="text-sm font-medium text-gray-900">
                        {atendimento.sinaisVitais[0].frequenciaCardiaca} bpm
                      </p>
                    </div>
                  )}
                  {atendimento.sinaisVitais[0].temperatura && (
                    <div className="bg-white rounded-lg p-2 border text-center">
                      <p className="text-xs text-gray-500">Temp</p>
                      <p className="text-sm font-medium text-gray-900">
                        {atendimento.sinaisVitais[0].temperatura}°C
                      </p>
                    </div>
                  )}
                  {atendimento.sinaisVitais[0].frequenciaRespiratoria && (
                    <div className="bg-white rounded-lg p-2 border text-center">
                      <p className="text-xs text-gray-500">FR</p>
                      <p className="text-sm font-medium text-gray-900">
                        {atendimento.sinaisVitais[0].frequenciaRespiratoria} irpm
                      </p>
                    </div>
                  )}
                  {atendimento.sinaisVitais[0].saturacaoOxigenio && (
                    <div className="bg-white rounded-lg p-2 border text-center">
                      <p className="text-xs text-gray-500">SpO2</p>
                      <p className="text-sm font-medium text-gray-900">
                        {atendimento.sinaisVitais[0].saturacaoOxigenio}%
                      </p>
                    </div>
                  )}
                  {atendimento.sinaisVitais[0].peso && (
                    <div className="bg-white rounded-lg p-2 border text-center">
                      <p className="text-xs text-gray-500">Peso</p>
                      <p className="text-sm font-medium text-gray-900">
                        {atendimento.sinaisVitais[0].peso} kg
                      </p>
                    </div>
                  )}
                  {atendimento.sinaisVitais[0].altura && (
                    <div className="bg-white rounded-lg p-2 border text-center">
                      <p className="text-xs text-gray-500">Altura</p>
                      <p className="text-sm font-medium text-gray-900">
                        {atendimento.sinaisVitais[0].altura} cm
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Diagnósticos do Atendimento */}
        {loadingConditions ? (
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 text-orange-600" />
              Diagnósticos:
            </h4>
            <div className="text-center py-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500 mx-auto"></div>
              <p className="text-xs text-gray-500 mt-1">Carregando...</p>
            </div>
          </div>
        ) : conditions.filter(c => c.source === 'DIAGNOSED' && c.appointmentId === atendimento.id).length > 0 ? (
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 text-orange-600" />
              Diagnósticos Informados:
            </h4>
            <div className="space-y-2">
              {conditions
                .filter(c => c.source === 'DIAGNOSED' && c.appointmentId === atendimento.id)
                .map((condition) => (
                  <div key={condition.id} className="flex items-center justify-between p-2 bg-orange-100 rounded-lg">
                    <span className="text-sm font-medium text-gray-900">{condition.condition.name}</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      condition.status === 'ACTIVE' ? 'bg-orange-200 text-orange-800' :
                      condition.status === 'RESOLVED' ? 'bg-blue-200 text-blue-800' :
                      'bg-gray-200 text-gray-800'
                    }`}>
                      {condition.status === 'ACTIVE' ? 'Ativo' :
                       condition.status === 'RESOLVED' ? 'Resolvido' :
                       condition.status}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 text-orange-600" />
              Diagnósticos:
            </h4>
            <p className="text-sm text-gray-500">Nenhum diagnóstico informado neste atendimento</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Conteúdo das tabs */}
      <div className="space-y-4">
        {activeTab === 'evolucoes' && (
          <div>
            {atendimento.evolucoes.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhuma evolução registrada</p>
            ) : (
              <div className="space-y-3">
                {atendimento.evolucoes.map((evolucao) => (
                  <div key={evolucao.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">
                        {evolucao.resumo || 'Evolução'}
                      </h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>v{evolucao.currentVersion}</span>
                        {evolucao.locked && <Lock className="w-3 h-3" />}
                      </div>
                    </div>
                    <div 
                      className="text-gray-700 text-sm mb-2 whitespace-pre-wrap break-words"
                      style={{
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {evolucao.texto}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDateTime(evolucao.registradoEm)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'sinais-vitais' && (
          <div>
            {atendimento.sinaisVitais.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhum sinal vital registrado</p>
            ) : (
              <div className="space-y-3">
                {atendimento.sinaisVitais.map((vital) => (
                  <div key={vital.id} className="border rounded-lg p-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">PA:</span>
                        <span className="ml-1 font-medium">
                          {vital.pressaoSistolica}/{vital.pressaoDiastolica} mmHg
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">FC:</span>
                        <span className="ml-1 font-medium">{vital.frequenciaCardiaca} bpm</span>
                      </div>
                      <div>
                        <span className="text-gray-500">FR:</span>
                        <span className="ml-1 font-medium">{vital.frequenciaRespiratoria} irpm</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Sat:</span>
                        <span className="ml-1 font-medium">{vital.saturacaoOxigenio}%</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Temp:</span>
                        <span className="ml-1 font-medium">{vital.temperatura}°C</span>
                      </div>
                      {vital.peso && (
                        <div>
                          <span className="text-gray-500">Peso:</span>
                          <span className="ml-1 font-medium">{vital.peso} kg</span>
                        </div>
                      )}
                      {vital.altura && (
                        <div>
                          <span className="text-gray-500">Altura:</span>
                          <span className="ml-1 font-medium">{vital.altura} cm</span>
                        </div>
                      )}
                    </div>
                    {vital.observacoes && (
                      <div 
                        className="text-gray-700 text-sm mt-2 whitespace-pre-wrap break-words"
                        style={{
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'pre-wrap'
                        }}
                      >
                        {vital.observacoes}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-2">
                      {formatDateTime(vital.registradoEm)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'anexos' && (
          <div>
            {atendimento.anexos.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhum anexo registrado</p>
            ) : (
              <div className="space-y-3">
                {atendimento.anexos.map((anexo) => (
                  <div key={anexo.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {anexo.titulo || anexo.filename}
                        </h4>
                        {anexo.tipoDocumento && (
                          <p className="text-sm text-gray-500">{anexo.tipoDocumento}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          {(anexo.size / 1024 / 1024).toFixed(2)} MB • {formatDateTime(anexo.createdAt)}
                        </p>
                      </div>
                      <button
                        onClick={() => window.open(anexo.urlPublica || '#', '_blank')}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        Visualizar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
