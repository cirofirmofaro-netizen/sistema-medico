import React, { useState } from 'react';
import { Calendar, List, DollarSign, Plus, CalendarDays } from 'lucide-react';
import { usePlantoes, useResumoPlantoes } from '../../lib/hooks/usePlantoes';
import { useFontesAtivas } from '../../lib/hooks/useFontes';
import { EmptyState } from '../../components/shared/EmptyState';
import { formatDate, formatMoney } from '../../lib/format';
import type { PlantaoFilters } from '../../lib/types';

// Componentes que serão criados
import { PlantaoCard } from '../../components/plantoes/PlantaoCard';
import { PlantaoTable } from '../../components/plantoes/PlantaoTable';
import { PlantaoAvulsoModal } from '../../components/plantoes/PlantaoAvulsoModal';

type TabType = 'agenda' | 'lista' | 'financeiro';

export default function PlantoesPage() {
  const [activeTab, setActiveTab] = useState<TabType>('agenda');
  const [filters, setFilters] = useState<PlantaoFilters>({});
  const [showPlantaoModal, setShowPlantaoModal] = useState(false);

  // Hooks de dados
  const { data: plantoes, isLoading: isLoadingPlantoes } = usePlantoes(filters);
  const { data: resumo, isLoading: isLoadingResumo } = useResumoPlantoes();
  const { data: fontes } = useFontesAtivas();

  // Filtros
  const handleFilterChange = (newFilters: Partial<PlantaoFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Tabs
  const tabs = [
    {
      id: 'agenda' as TabType,
      label: 'Agenda',
      icon: Calendar,
    },
    {
      id: 'lista' as TabType,
      label: 'Lista',
      icon: List,
    },
    {
      id: 'financeiro' as TabType,
      label: 'Financeiro',
      icon: DollarSign,
    },
  ];

  // Renderizar conteúdo baseado na tab ativa
  const renderTabContent = () => {
    switch (activeTab) {
      case 'agenda':
        return <AgendaTab plantoes={plantoes || []} isLoading={isLoadingPlantoes} />;
      case 'lista':
        return (
          <ListaTab 
            plantoes={plantoes || []} 
            isLoading={isLoadingPlantoes}
            filters={filters}
            onFilterChange={handleFilterChange}
            fontes={fontes || []}
          />
        );
      case 'financeiro':
        return <FinanceiroTab resumo={resumo} isLoading={isLoadingResumo} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Plantões</h1>
              <p className="text-gray-600">Gerencie seus plantões e controle financeiro</p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowPlantaoModal(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Plantão
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center px-1 py-4 text-sm font-medium border-b-2 transition-colors
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </div>

      {/* Modal de Plantão Avulso */}
      <PlantaoAvulsoModal
        isOpen={showPlantaoModal}
        onClose={() => setShowPlantaoModal(false)}
        fontes={fontes || []}
      />
    </div>
  );
}

// Componente para Tab Agenda
function AgendaTab({ plantoes, isLoading }: { plantoes: any[]; isLoading: boolean }) {
  if (isLoading) {
    return <AgendaSkeleton />;
  }

  if (plantoes.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="Nenhum plantão agendado"
        description="Você ainda não tem plantões agendados. Crie um novo plantão para começar."
        action={{
          label: "Criar Plantão",
          onClick: () => {},
          variant: "primary"
        }}
      />
    );
  }

  // Agrupar plantões por data
  const plantoesPorData = plantoes.reduce((acc, plantao) => {
    const data = formatDate(plantao.data);
    if (!acc[data]) {
      acc[data] = [];
    }
    acc[data].push(plantao);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-6">
      {Object.entries(plantoesPorData).map(([data, plantoesDoDia]) => (
        <div key={data} className="bg-white rounded-2xl shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{data}</h3>
            <p className="text-sm text-gray-600">{plantoesDoDia.length} plantão(ões)</p>
          </div>
          
          <div className="p-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {plantoesDoDia.map((plantao) => (
                <PlantaoCard key={plantao.id} plantao={plantao} />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Componente para Tab Lista
function ListaTab({ 
  plantoes, 
  isLoading, 
  filters, 
  onFilterChange, 
  fontes 
}: { 
  plantoes: any[]; 
  isLoading: boolean;
  filters: PlantaoFilters;
  onFilterChange: (filters: Partial<PlantaoFilters>) => void;
  fontes: any[];
}) {
  if (isLoading) {
    return <ListaSkeleton />;
  }

  return (
    <PlantaoTable
      plantoes={plantoes}
      filters={filters}
      onFilterChange={onFilterChange}
      fontes={fontes}
    />
  );
}

// Componente para Tab Financeiro
function FinanceiroTab({ resumo, isLoading }: { resumo: any; isLoading: boolean }) {
  if (isLoading) {
    return <FinanceiroSkeleton />;
  }

  if (!resumo) {
    return (
      <EmptyState
        icon={DollarSign}
        title="Nenhum dado financeiro"
        description="Não há dados financeiros disponíveis para exibir."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Recebido</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatMoney(resumo.valorTotalRealizado || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Plantões Realizados</p>
              <p className="text-2xl font-bold text-gray-900">
                {resumo.realizados || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-amber-100 rounded-lg">
              <List className="w-6 h-6 text-amber-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Agendado</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatMoney(resumo.valorTotalPrevisto || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <CalendarDays className="w-6 h-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Plantões</p>
              <p className="text-2xl font-bold text-gray-900">
                {resumo.total || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Resumo por fonte pagadora */}
      {resumo.porFontePagadora && Object.keys(resumo.porFontePagadora).length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Por Fonte Pagadora</h3>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {Object.entries(resumo.porFontePagadora).map(([fonte, dados]: [string, any]) => (
                <div key={fonte} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{fonte}</p>
                    <p className="text-sm text-gray-600">
                      {dados.realizados} de {dados.total} plantões realizados
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {formatMoney(dados.valorRealizado || 0)}
                    </p>
                    <p className="text-sm text-gray-600">
                      de {formatMoney(dados.valorPrevisto || 0)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Skeletons
function AgendaSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-2xl shadow-sm border animate-pulse">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="p-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ListaSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border animate-pulse">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="h-6 bg-gray-200 rounded w-32"></div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FinanceiroSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border p-6 animate-pulse">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
              <div className="ml-4">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
