// Utilitários de formatação para o módulo de Plantões

export const formatMoney = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(dateObj);
};

export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
};

export const formatTime = (time: string): string => {
  // time está no formato "HH:mm"
  return time;
};

export const formatCompetencia = (competencia: string): string => {
  // competencia está no formato "AAAA-MM"
  const [ano, mes] = competencia.split('-');
  const mesNome = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(
    new Date(parseInt(ano), parseInt(mes) - 1)
  );
  return `${mesNome}/${ano}`;
};

export const formatCNPJ = (cnpj: string): string => {
  // Remove caracteres não numéricos
  const clean = cnpj.replace(/\D/g, '');
  
  // Aplica máscara XX.XXX.XXX/XXXX-XX
  return clean.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  );
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}min`;
  }
  
  if (mins === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h${mins}min`;
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'AGENDADO':
      return 'bg-slate-100 text-slate-800 border-slate-200';
    case 'REALIZADO':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'CANCELADO':
      return 'bg-rose-100 text-rose-800 border-rose-200';
    case 'TROCADO':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'PENDENTE':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'PARCIAL':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'PAGO':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'EM_ATRASO':
      return 'bg-red-50 text-red-700 border-red-300 border-dashed';
    case 'SOLICITADO':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'RECEBIDO':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'AGENDADO':
      return 'Agendado';
    case 'REALIZADO':
      return 'Realizado';
    case 'CANCELADO':
      return 'Cancelado';
    case 'TROCADO':
      return 'Trocado';
    case 'PENDENTE':
      return 'Pendente';
    case 'PARCIAL':
      return 'Parcial';
    case 'PAGO':
      return 'Pago';
    case 'EM_ATRASO':
      return 'Em Atraso';
    case 'SOLICITADO':
      return 'Solicitado';
    case 'RECEBIDO':
      return 'Recebido';
    default:
      return status;
  }
};

export const getTipoVinculoLabel = (tipo: string): string => {
  switch (tipo) {
    case 'CLT':
      return 'CLT';
    case 'RPA':
      return 'RPA';
    case 'PJ':
      return 'PJ';
    case 'COOPERATIVA':
      return 'Cooperativa';
    case 'AUTONOMO':
      return 'Autônomo';
    default:
      return tipo;
  }
};

export const getPagadorLabel = (pagador: string): string => {
  switch (pagador) {
    case 'HOSPITAL':
      return 'Hospital';
    case 'PLANTONISTA':
      return 'Plantonista';
    default:
      return pagador;
  }
};

export const getMeioPagamentoLabel = (meio: string): string => {
  switch (meio) {
    case 'HOSPITAL':
      return 'Hospital';
    case 'PLANTONISTA':
      return 'Plantonista';
    default:
      return meio;
  }
};

export const getRecorrenciaLabel = (recorrencia: any): string => {
  if (!recorrencia) return 'Sem recorrência';
  
  const { freq, interval = 1, byWeekday } = recorrencia;
  
  switch (freq) {
    case 'WEEKLY':
      if (byWeekday && byWeekday.length > 0) {
        const dias = byWeekday.map((day: number) => {
          const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
          return diasSemana[day];
        });
        return `Semanal (${dias.join(', ')})`;
      }
      return `Semanal (a cada ${interval} semana${interval > 1 ? 's' : ''})`;
    case 'BIWEEKLY':
      return `Quinzenal (a cada ${interval} quinzena${interval > 1 ? 's' : ''})`;
    case 'MONTHLY':
      return `Mensal (a cada ${interval} mês${interval > 1 ? 'es' : ''})`;
    default:
      return 'Recorrência personalizada';
  }
};

export const getWeekdayName = (day: number): string => {
  const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  return diasSemana[day];
};

export const getWeekdayShort = (day: number): string => {
  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  return diasSemana[day];
};
