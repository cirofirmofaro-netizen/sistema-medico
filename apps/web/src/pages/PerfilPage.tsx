import { useAuth } from '../contexts/AuthContext'

export function PerfilPage() {
  const { user } = useAuth()
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Perfil</h2>
      <div className="card">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome</label>
            <p className="mt-1 text-gray-900">{user?.nome}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-gray-900">{user?.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Especialidade</label>
            <p className="mt-1 text-gray-900">{user?.especialidade}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
