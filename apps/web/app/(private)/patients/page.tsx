'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/lib/ui/card'
import { Button } from '@/lib/ui/button'
import { Input } from '@/lib/ui/input'
import { Badge } from '@/lib/ui/badge'
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2
} from 'lucide-react'
import { mockPatients } from '@/lib/mock/patients'
import { formatCPF, formatPhone } from '@/lib/format'

export default function PatientsPage() {
  const [patients, setPatients] = useState(mockPatients)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const savedPatients = localStorage.getItem('patients')
    if (savedPatients) {
      setPatients(JSON.parse(savedPatients))
    }
  }, [])

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.cpf.includes(searchTerm) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Users className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pacientes</h1>
            <p className="text-gray-600">{filteredPatients.length} pacientes encontrados</p>
          </div>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Novo Paciente
        </Button>
      </div>

      {/* Busca e filtros */}
      <div className="flex space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar por nome, CPF, email ou telefone... (Pressione / para focar)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filtros
        </Button>
      </div>

      {/* Tabela de pacientes */}
      <Card className="card-shadow">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-900">PACIENTE</th>
                  <th className="text-left p-4 font-medium text-gray-900">CONTATO</th>
                  <th className="text-left p-4 font-medium text-gray-900">IDADE/SEXO</th>
                  <th className="text-left p-4 font-medium text-gray-900">CADASTRO</th>
                  <th className="text-left p-4 font-medium text-gray-900">AÇÕES</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{patient.name}</div>
                        <div className="text-sm text-gray-500">CPF: {formatCPF(patient.cpf)}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="text-sm">{formatPhone(patient.phone)}</div>
                        <div className="text-sm text-gray-500">{patient.email}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{patient.age} anos</span>
                        <Badge 
                          variant="outline" 
                          className={patient.gender === 'Feminino' ? 'bg-pink-100 text-pink-800 border-pink-200' : 'bg-blue-100 text-blue-800 border-blue-200'}
                        >
                          {patient.gender}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {patient.registrationDate}
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="w-8 h-8 p-0">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="w-8 h-8 p-0 text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
