import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Layout } from './components/Layout'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { Pacientes } from './pages/pacientes/Pacientes'
import PlantoesPage from './pages/plantao'
import PlantaoDetail from './pages/plantoes/PlantaoDetail'
import NewConsultaPage from './pages/appointments/NewConsultaPage'
import { ProntuariosPage } from './pages/ProntuariosPage'
import { ConfiguracoesPage } from './pages/ConfiguracoesPage'
import { PerfilPage } from './pages/PerfilPage'

// Novas importações para o módulo Pacientes/Prontuário
import { PatientsList } from './pages/patients/PatientsList'
import { PatientDetail } from './pages/patients/PatientDetail'
import { Appointments } from './pages/appointments/Appointments'
import { Telemedicine } from './pages/telemedicine/Telemedicine'

// Configurar React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// Componente de loading
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center shadow-2xl mx-auto mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
        <p className="text-gray-600">Carregando...</p>
      </div>
    </div>
  )
}

// Componente para rotas protegidas
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  
  if (isLoading) {
    return <LoadingScreen />
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return <Layout>{children}</Layout>
}

// Componente para rotas públicas (apenas login)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  
  if (isLoading) {
    return <LoadingScreen />
  }
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }
  
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      {/* Rota pública */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } 
      />
      
      {/* Rotas protegidas */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Rotas do módulo Plantões (mantidas) */}
      <Route 
        path="/plantoes" 
        element={
          <ProtectedRoute>
            <PlantoesPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/plantoes/:id" 
        element={
          <ProtectedRoute>
            <PlantaoDetail />
          </ProtectedRoute>
        } 
      />
      
      {/* Rotas do módulo Pacientes/Prontuário */}
      <Route 
        path="/patients" 
        element={
          <ProtectedRoute>
            <PatientsList />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/patients/:id" 
        element={
          <ProtectedRoute>
            <PatientDetail />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/appointments" 
        element={
          <ProtectedRoute>
            <Appointments />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/appointments/new" 
        element={
          <ProtectedRoute>
            <NewConsultaPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/telemedicine/:id" 
        element={
          <ProtectedRoute>
            <Telemedicine />
          </ProtectedRoute>
        } 
      />
      
      {/* Rotas legadas (mantidas para compatibilidade) */}
      <Route 
        path="/pacientes" 
        element={
          <ProtectedRoute>
            <Pacientes />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/prontuarios" 
        element={
          <ProtectedRoute>
            <ProntuariosPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/configuracoes" 
        element={
          <ProtectedRoute>
            <ConfiguracoesPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/perfil" 
        element={
          <ProtectedRoute>
            <PerfilPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Redirecionar rotas não encontradas */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppRoutes />
          <Toaster 
            position="top-right"
            richColors
            closeButton
          />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
