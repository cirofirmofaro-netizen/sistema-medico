import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import PlantoesList from '../screens/PlantoesList';
import PlantaoForm from '../screens/PlantaoForm';
import PlantaoDetail from '../screens/PlantaoDetail';
import SettingsScreen from '../screens/SettingsScreen';
import FinanceiroResumo from '../screens/FinanceiroResumo';
import PacientesList from '../screens/PacientesList';
import PacienteForm from '../screens/PacienteForm';
import EvolucoesList from '../screens/EvolucoesList';
import EvolucaoForm from '../screens/EvolucaoForm';
import ExportProntuario from '../screens/ExportProntuario';
import PacienteDetail from '../screens/PacienteDetail';

const Stack = createStackNavigator();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="PlantoesList" component={PlantoesList} options={{ title: 'Meus Plantões' }} />
        <Stack.Screen name="PlantaoForm" component={PlantaoForm} options={{ title: 'Novo Plantão' }} />
        <Stack.Screen name="PlantaoDetail" component={PlantaoDetail} options={{ title: 'Detalhe do Plantão' }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Configurações' }} />
        <Stack.Screen name="FinanceiroResumo" component={FinanceiroResumo} options={{ title: 'Resumo Financeiro' }} />
        <Stack.Screen name="PacientesList" component={PacientesList} options={{ title: 'Pacientes' }} />
        <Stack.Screen name="PacienteForm" component={PacienteForm} options={{ title: 'Novo Paciente' }} />
        <Stack.Screen name="EvolucoesList" component={EvolucoesList} options={{ title:'Evoluções' }} />
        <Stack.Screen name="EvolucaoForm" component={EvolucaoForm} options={{ title:'Nova Evolução' }} />
        <Stack.Screen name="ExportProntuario" component={ExportProntuario} options={{ title:'Exportar Prontuário' }} />
        <Stack.Screen name="PacienteDetail" component={PacienteDetail} options={{ title:'Ficha do Paciente' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
