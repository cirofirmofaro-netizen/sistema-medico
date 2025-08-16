import * as React from 'react';
import { NavigationContainer, DarkTheme as NavDark, DefaultTheme as NavLight } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { PaperProvider, MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import { useColorScheme } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect } from 'react';

// Screens existentes
import PlantoesList from './src/screens/PlantoesList';
import PlantaoForm from './src/screens/PlantaoForm';
import PacientesList from './src/screens/PacientesList';
import PacienteForm from './src/screens/PacienteForm';
import FinanceiroResumo from './src/screens/FinanceiroResumo';
import SettingsScreen from './src/screens/SettingsScreen';
import PlantaoDetail from './src/screens/PlantaoDetail';
import EvolucoesList from './src/screens/EvolucoesList';
import EvolucaoForm from './src/screens/EvolucaoForm';
import AnexosList from './src/screens/AnexosList';
import ReceitaForm from './src/screens/ReceitaForm';

// Novas telas do MVP
import LoginScreen from './src/screens/LoginScreen';
import Appointments from './src/screens/Appointments';
import AppointmentForm from './src/screens/AppointmentForm';
import PacienteDetail from './src/screens/PacienteDetail';

// Tela Home simples com ações rápidas
import HomeScreen from './src/screens/HomeScreen';
import { useSettings } from './src/stores/useSettings';
import { useAuthStore } from './src/stores/authStore';

const queryClient = new QueryClient();
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack de autenticação
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}

// Stack principal da aplicação
function MainStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="MainTabs" 
        component={MainTabs} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="PacienteForm" 
        component={PacienteForm} 
        options={{ title: 'Paciente' }}
      />
      <Stack.Screen 
        name="PacienteDetail" 
        component={PacienteDetail} 
        options={{ title: 'Detalhes do Paciente' }}
      />
      <Stack.Screen 
        name="AppointmentForm" 
        component={AppointmentForm} 
        options={{ title: 'Consulta' }}
      />
      <Stack.Screen 
        name="PlantaoForm" 
        component={PlantaoForm} 
        options={{ title: 'Plantão' }}
      />
      <Stack.Screen 
        name="PlantaoDetail" 
        component={PlantaoDetail} 
        options={{ title: 'Detalhes do Plantão' }}
      />
      <Stack.Screen 
        name="EvolucoesList" 
        component={EvolucoesList} 
        options={{ title: 'Evoluções' }}
      />
      <Stack.Screen 
        name="EvolucaoForm" 
        component={EvolucaoForm} 
        options={{ title: 'Evolução' }}
      />
      <Stack.Screen 
        name="AnexosList" 
        component={AnexosList} 
        options={{ title: 'Anexos' }}
      />
      <Stack.Screen 
        name="ReceitaForm" 
        component={ReceitaForm} 
        options={{ title: 'Receita' }}
      />
    </Stack.Navigator>
  );
}

// Tabs principais
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerTitleAlign: 'center',
        tabBarShowLabel: true,
        tabBarIcon: ({ color, size }) => {
          const map: Record<string, string> = {
            Home: 'home-variant',
            Plantoes: 'calendar-clock',
            Consultas: 'calendar-check',
            Pacientes: 'account-heart',
            Resumo: 'chart-box-outline',
            Config: 'cog',
          };
          const name = map[route.name] ?? 'circle';
          return <MaterialCommunityIcons name={name as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Início' }} />
      <Tab.Screen name="Plantoes" component={PlantoesList} options={{ title: 'Plantões' }} />
      <Tab.Screen name="Consultas" component={Appointments} options={{ title: 'Consultas' }} />
      <Tab.Screen name="Pacientes" component={PacientesList} options={{ title: 'Pacientes' }} />
      <Tab.Screen name="Resumo" component={FinanceiroResumo} options={{ title: 'Resumo' }} />
      <Tab.Screen name="Config" component={SettingsScreen} options={{ title: 'Config' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const scheme = useColorScheme();
  const paperTheme = scheme === 'dark' ? MD3DarkTheme : MD3LightTheme;
  const navTheme = scheme === 'dark' ? NavDark : NavLight;
  const hydrate = useSettings((s) => s.hydrate);
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    hydrate();
    checkAuth();
  }, [hydrate, checkAuth]);

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return null; // Ou um componente de loading
  }

  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={paperTheme}>
        <NavigationContainer theme={navTheme}>
          {isAuthenticated ? <MainStack /> : <AuthStack />}
        </NavigationContainer>
      </PaperProvider>
    </QueryClientProvider>
  );
}
