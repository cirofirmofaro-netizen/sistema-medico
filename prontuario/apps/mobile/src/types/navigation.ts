import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Login: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  PacienteForm: { pacienteId?: string };
  AppointmentForm: { appointmentId?: string };
  PlantaoForm: { id?: string };
  PlantaoDetail: { id: string };
  EvolucoesList: { pacienteId: string; nome: string };
  EvolucaoForm: { episodioId: string };
  AnexosList: { evolucaoId: string };
  ReceitaForm: { pacienteId: string; evolucaoId?: string };
  ExportProntuario: { pacienteId: string };
  PacienteDetail: { pacienteId: string };
  Resumo: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Plantoes: undefined;
  Pacientes: undefined;
  Consultas: undefined;
  Settings: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
