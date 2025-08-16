'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/lib/ui/card'
import { Button } from '@/lib/ui/button'
import { Badge } from '@/lib/ui/badge'
import { Calendar, Clock, MapPin, Plus } from 'lucide-react'
import { useState, useEffect } from 'react'
import { mockShifts } from '@/lib/mock/shifts'

export default function ShiftsPage() {
  const [shifts, setShifts] = useState(mockShifts)

  useEffect(() => {
    const savedShifts = localStorage.getItem('shifts')
    if (savedShifts) {
      setShifts(JSON.parse(savedShifts))
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Plantões</h1>
          <p className="text-gray-600">Gerencie seus plantões médicos</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Novo Plantão
        </Button>
      </div>

      {/* Lista de plantões */}
      <Card className="card-shadow">
        <CardHeader>
          <CardTitle>Próximos Plantões</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {shifts.map((shift) => (
              <div
                key={shift.id}
                className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  shift.type === 'noturno' ? 'bg-blue-100' : 'bg-green-100'
                }`}>
                  <Calendar className={`w-6 h-6 ${
                    shift.type === 'noturno' ? 'text-blue-600' : 'text-green-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{shift.title}</h3>
                  <p className="text-sm text-gray-600">{shift.hospital}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {shift.date} - {shift.startTime} às {shift.endTime}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {shift.location}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Plantões passados */}
      <div className="text-center text-gray-500">
        Nenhum plantão passado encontrado
      </div>
    </div>
  )
}
