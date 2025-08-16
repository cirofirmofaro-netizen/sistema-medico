import { useState } from 'react'
import { X, User, Calendar, Phone, Mail, MapPin, Hash, FileText, Edit } from 'lucide-react'
import { Paciente } from '../../types'

interface ViewPacienteDialogProps {
  open: boolean
  paciente: Paciente
  onClose: () => void
  onEdit?: () => void
}

export function ViewPacienteDialog({ open, paciente, onClose, onEdit }: ViewPacienteDialogProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'evolucoes'>('info')

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatAge = (dateString: string) => {
    const birthDate = new Date(dateString)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return `${age} anos`
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{paciente.nome}</h3>
                    <p className="text-sm text-gray-500">ID: {paciente.id}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {onEdit && (
                    <button
                      onClick={onEdit}
                      className="btn btn-secondary flex items-center space-x-2"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Editar</span>
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'info'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Informações
                </button>
                <button
                  onClick={() => setActiveTab('evolucoes')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'evolucoes'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Evoluções
                </button>
              </nav>
            </div>

            {/* Content */}
            <div className="px-6 py-4">
              {activeTab === 'info' ? (
                <div className="space-y-6">
                  {/* Informações Pessoais */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Informações Pessoais</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start space-x-3">
                        <User className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Nome</p>
                          <p className="text-sm text-gray-600">{paciente.nome}</p>
                        </div>
                      </div>

                      {paciente.dtNasc && (
                        <div className="flex items-start space-x-3">
                          <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Data de Nascimento</p>
                            <p className="text-sm text-gray-600">
                              {formatDate(paciente.dtNasc)} ({formatAge(paciente.dtNasc)})
                            </p>
                          </div>
                        </div>
                      )}

                      {paciente.sexo && (
                        <div className="flex items-start space-x-3">
                          <User className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Sexo</p>
                            <p className="text-sm text-gray-600">
                              {paciente.sexo === 'M' ? 'Masculino' : 'Feminino'}
                            </p>
                          </div>
                        </div>
                      )}

                      {paciente.cpf && (
                        <div className="flex items-start space-x-3">
                          <Hash className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">CPF</p>
                            <p className="text-sm text-gray-600">{paciente.cpf}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Informações de Contato */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Contato</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {paciente.telefone && (
                        <div className="flex items-start space-x-3">
                          <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Telefone</p>
                            <p className="text-sm text-gray-600">{paciente.telefone}</p>
                          </div>
                        </div>
                      )}

                      {paciente.email && (
                        <div className="flex items-start space-x-3">
                          <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Email</p>
                            <p className="text-sm text-gray-600">{paciente.email}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Endereço */}
                  {paciente.endereco && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Endereço</h4>
                      <div className="flex items-start space-x-3">
                        <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">{paciente.endereco}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Informações do Sistema */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Informações do Sistema</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Data de Cadastro</p>
                        <p className="text-sm text-gray-600">{formatDate(paciente.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Última Atualização</p>
                        <p className="text-sm text-gray-600">{formatDate(paciente.updatedAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Evoluções</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Sistema de evoluções em desenvolvimento...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
