import { useAuth } from '../contexts/AuthContext'

export function DashboardPage() {
  const { user } = useAuth()
  
  console.log('DashboardPage: renderizando com usuário:', user)

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Olá, {user?.nome || 'Médico'}! 👋
        </h1>
        <p className="text-gray-600">
          Bem-vindo ao seu painel de controle
        </p>
        <p className="text-sm text-gray-500 mt-2">
          {new Date().toLocaleDateString('pt-BR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Teste simples */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Dashboard funcionando! 🎉</h2>
        <p>Usuário logado: {user?.nome}</p>
        <p>Email: {user?.email}</p>
        <p>Especialidade: {user?.especialidade}</p>
      </div>
    </div>
  )
}
