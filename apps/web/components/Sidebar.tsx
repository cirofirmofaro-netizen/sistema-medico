'use client'

import { usePathname, useRouter } from 'next/navigation'
import { 
  Home, 
  Users, 
  Calendar, 
  FileText, 
  Settings, 
  User,
  LogOut
} from 'lucide-react'
import { Logo } from './Logo'
import { useAtom } from 'jotai'
import { userAtom } from '@/lib/auth'
import { logout } from '@/lib/auth'

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: Home },
  { path: '/patients', label: 'Pacientes', icon: Users },
  { path: '/shifts', label: 'Plantões', icon: Calendar },
  { path: '/prontuarios', label: 'Prontuários', icon: FileText },
  { path: '/settings', label: 'Configurações', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user] = useAtom(userAtom)

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <div className="w-64 bg-blue-900 text-white h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-blue-800">
        <Logo />
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.path
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center space-x-3 px-6 py-3 text-left transition-colors ${
                isActive 
                  ? 'bg-blue-700 text-white' 
                  : 'text-blue-200 hover:bg-blue-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className="p-6 border-t border-blue-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">{user?.name || 'Usuário'}</p>
            <p className="text-xs text-blue-300">{user?.specialty || 'Médico'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-blue-300 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
