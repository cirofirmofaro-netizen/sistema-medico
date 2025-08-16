import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  Users, 
  Calendar, 
  FileText, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  User,
  Home,
  Bell,
  Search,
  Video
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logout realizado com sucesso!')
    navigate('/login')
  }

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Pacientes', href: '/patients', icon: Users },
    { name: 'Consultas', href: '/appointments', icon: Calendar },
    { name: 'Plantões', href: '/plantoes', icon: Calendar },
    { name: 'Telemedicina', href: '/telemedicine', icon: Video },
    { name: 'Configurações', href: '/configuracoes', icon: Settings },
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Sidebar para desktop */}
      <div className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-white/80 backdrop-blur-xl border-r border-white/20 shadow-2xl">
          {/* Logo */}
          <div className="flex items-center h-20 px-6 bg-gradient-to-r from-primary-600 to-primary-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-primary-600 font-bold text-xl">🏥</span>
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-white font-bold text-xl">Plantão Médico</h1>
                <p className="text-primary-100 text-sm">Sistema Profissional</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-grow flex flex-col overflow-y-auto">
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive(item.href)
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg transform scale-105'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-primary-600 hover:shadow-md'
                    }`}
                  >
                    <Icon className={`mr-3 h-5 w-5 transition-colors ${
                      isActive(item.href) ? 'text-white' : 'text-gray-400 group-hover:text-primary-500'
                    }`} />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* User info */}
          <div className="flex-shrink-0 border-t border-gray-200 p-6 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-md">
                  <User className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-semibold text-gray-900">{user?.nome}</p>
                <p className="text-xs text-gray-500">{user?.especialidade}</p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Sair"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className={`lg:hidden fixed inset-0 z-50 ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white/95 backdrop-blur-xl">
          <div className="absolute top-0 right-0 -mr-12 pt-4">
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>
          </div>
          
          {/* Mobile navigation */}
          <div className="flex-1 h-0 pt-8 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-6 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">🏥</span>
              </div>
              <h1 className="ml-3 text-xl font-bold text-gray-900">Plantão Médico</h1>
            </div>
            <nav className="px-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`group flex items-center px-4 py-3 text-base font-medium rounded-xl transition-all duration-200 ${
                      isActive(item.href)
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-primary-600'
                    }`}
                  >
                    <Icon className={`mr-4 h-6 w-6 ${
                      isActive(item.href) ? 'text-white' : 'text-gray-400 group-hover:text-primary-500'
                    }`} />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72 flex flex-col flex-1">
        {/* Top bar */}
        <div className="sticky top-0 z-40 lg:hidden bg-white/80 backdrop-blur-xl border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                <Search className="h-5 w-5" />
              </button>
              <button className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            <div className="animate-fade-in">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
