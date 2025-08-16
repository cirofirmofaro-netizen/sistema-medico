import React from 'react'
import { Calendar, Plus, Clock, MapPin } from 'lucide-react'

export function PlantoesPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Plantões</h1>
        <p className="text-gray-600">Gerencie seus plantões médicos</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Próximos Plantões</h2>
          <button className="btn btn-primary flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Novo Plantão
          </button>
        </div>

        <div className="space-y-4">
          <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Plantão UPA 24h</h3>
                  <p className="text-sm text-gray-500">Hospital Municipal</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  15/08/2024 - 19:00 às 07:00
                </div>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  São Paulo, SP
                </div>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Plantão Pronto Socorro</h3>
                  <p className="text-sm text-gray-500">Hospital Albert Einstein</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  18/08/2024 - 07:00 às 19:00
                </div>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  São Paulo, SP
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-500">
          <p>Nenhum plantão passado encontrado</p>
        </div>
      </div>
    </div>
  )
}
