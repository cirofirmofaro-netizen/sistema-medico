'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/lib/ui/card'
import { Button } from '@/lib/ui/button'
import { Badge } from '@/lib/ui/badge'
import { 
  Edit,
  Calendar,
  Phone,
  Mail,
  MapPin,
  FileText,
  Activity,
  Paperclip,
  History,
  Clock
} from 'lucide-react'
import { mockPatients } from '@/lib/mock/patients'
import { formatCPF, formatPhone } from '@/lib/format'

const tabs = [
  { id: 'info', label: 'Informações', icon: FileText },
  { id: 'evolutions', label: 'Evoluções (5)', icon: Activity },
  { id: 'vitals', label: 'Sinais Vitais (5)', icon: Activity },
  { id: 'attachments', label: 'Anexos (5)', icon: Paperclip },
  { id: 'history', label: 'Histórico Clínico', icon: History },
  { id: 'appointments', label: 'Atendimentos do Dia', icon: Clock },
]

export default function PatientDetailPage() {
  const params = useParams()
  const [patients, setPatients] = useState(mockPatients)
  const [activeTab, setActiveTab] = useState('info')

  useEffect(() => {
    const savedPatients = localStorage.getItem('patients')
    if (savedPatients) {
      setPatients(JSON.parse(savedPatients))
    }
  }, [])

  const patient = patients.find(p => p.id === params.id)

  if (!patient) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Paciente não encontrado</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{patient.name}</h1>
          <p className="text-gray-600">Detalhes do paciente</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
          <Button className="bg-primary hover:bg-primary/90">
            <Calendar className="w-4 h-4 mr-2" />
            Agendar Consulta
          </Button>
        </div>
      </div>

      {/* Abas */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Conteúdo das abas */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dados Pessoais */}
          <Card className="card-shadow">
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-blue-900">Dados Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Nome Completo</label>
                <p className="text-gray-900">{patient.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Data de Nascimento</label>
                <p className="text-gray-500">Data de nascimento não informada</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Sexo</label>
                <p className="text-gray-900">{patient.gender}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">CPF</label>
                <p className="text-gray-900">{formatCPF(patient.cpf)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Telefone</label>
                <p className="text-gray-900">{formatPhone(patient.phone)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <p className="text-gray-900">{patient.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Endereço</label>
                <p className="text-gray-900">{patient.address}</p>
              </div>
            </CardContent>
          </Card>

          {/* Comorbidades */}
          <Card className="card-shadow">
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-blue-900">Comorbidades Pré-existentes</CardTitle>
            </CardHeader>
            <CardContent>
              {patient.comorbidities.length > 0 ? (
                <ul className="space-y-2">
                  {patient.comorbidities.map((comorbidity, index) => (
                    <li key={index} className="text-gray-900">{comorbidity}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">Nenhuma comorbidade registrada</p>
              )}
            </CardContent>
          </Card>

          {/* Alergias */}
          <Card className="card-shadow">
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-blue-900">Alergias</CardTitle>
            </CardHeader>
            <CardContent>
              {patient.allergies.length > 0 ? (
                <div className="space-y-2">
                  {patient.allergies.map((allergy) => (
                    <div key={allergy.id} className="flex items-center justify-between">
                      <span className="text-gray-900">{allergy.name} ({allergy.type})</span>
                      <Badge 
                        variant="destructive" 
                        className="bg-red-100 text-red-800 border-red-200"
                      >
                        {allergy.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Nenhuma alergia registrada</p>
              )}
            </CardContent>
          </Card>

          {/* Medicamentos */}
          <Card className="card-shadow">
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-blue-900">Medicamentos de Uso Contínuo</CardTitle>
            </CardHeader>
            <CardContent>
              {patient.continuousMedications.length > 0 ? (
                <div className="space-y-2">
                  {patient.continuousMedications.map((medication) => (
                    <div key={medication.id} className="flex items-center justify-between">
                      <div>
                        <span className="text-gray-900">{medication.name}</span>
                        <p className="text-sm text-gray-500">{medication.dosage} {medication.frequency}</p>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className="bg-blue-100 text-blue-800 border-blue-200"
                      >
                        {medication.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Nenhum medicamento registrado</p>
              )}
            </CardContent>
          </Card>

          {/* Último Atendimento */}
          <Card className="card-shadow lg:col-span-2">
            <CardHeader className="bg-green-50">
              <CardTitle className="text-green-900">Último Atendimento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-700">14/08/2025</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Finalizado
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Evolução 1</label>
                      <p className="text-gray-900">Paciente refere dor de cabeça e indisposição</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Profissional</label>
                      <p className="text-gray-900">Dr. Usuário Teste</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Sinais Vitais</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">PA:</span> 120/80 mmHg
                    </div>
                    <div>
                      <span className="text-gray-600">SpO2:</span> 99%
                    </div>
                    <div>
                      <span className="text-gray-600">FC:</span> 85 bpm
                    </div>
                    <div>
                      <span className="text-gray-600">Temp:</span> 36°C
                    </div>
                    <div>
                      <span className="text-gray-600">Peso:</span> 80 kg
                    </div>
                    <div>
                      <span className="text-gray-600">Altura:</span> 158 cm
                    </div>
                    <div>
                      <span className="text-gray-600">FR:</span> 16 irpm
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Outras abas com placeholder */}
      {activeTab !== 'info' && (
        <Card className="card-shadow">
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">Conteúdo da aba &quot;{tabs.find(t => t.id === activeTab)?.label}&quot; será implementado em breve.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
