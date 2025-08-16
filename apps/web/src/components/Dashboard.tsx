import { useState } from 'react'
import { LogOut, User, Calendar, Users, FileText, Settings, Menu, X } from 'lucide-react'
import { toast } from 'sonner'
import { DashboardPage } from '../pages/DashboardPage'
import { Pacientes } from '../pages/pacientes/Pacientes'
import { ProntuariosPage } from '../pages/ProntuariosPage'
import { PerfilPage } from '../pages/PerfilPage'
import { ConfiguracoesPage } from '../pages/ConfiguracoesPage'

interface DashboardProps {
  user: any
  onLogout: () => void
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')

  const handleLogout = () => {
    toast.success('Logout realizado com sucesso!')
    onLogout()
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Calendar },
    { id: 'patients', label: 'Pacientes', icon: Users },
    { id: 'records', label: 'Prontuários', icon: FileText },
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ]



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-bold text-gray-900">Sistema Médico</h1>
            <button onClick={() => setSidebarOpen(false)}>
              <X className="h-6 w-6 text-gray-400" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id)
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  activeTab === item.id
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4">
            <h1 className="text-xl font-bold text-gray-900">Sistema Médico</h1>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  activeTab === item.id
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-700'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </button>
            ))}
          </nav>
          <div className="border-t border-gray-200 p-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.specialty}</p>
            </div>
            <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>

        <main className="p-4 sm:p-6 lg:p-8">
          {activeTab === 'dashboard' && <DashboardPage />}
          {activeTab === 'patients' && <Pacientes />}
          {activeTab === 'records' && <ProntuariosPage />}
          {activeTab === 'profile' && <PerfilPage />}
          {activeTab === 'settings' && <ConfiguracoesPage />}
        </main>
      </div>
    </div>
  )
}
