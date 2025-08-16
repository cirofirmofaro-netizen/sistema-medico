'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/lib/ui/card'
import { Badge } from '@/lib/ui/badge'
import { 
  Users, 
  Calendar, 
  FileText, 
  Clock, 
  TrendingUp,
  MapPin,
  Activity
} from 'lucide-react'

const stats = [
  {
    title: 'Pacientes Ativos',
    value: '156',
    increase: '+12%',
    icon: Users,
    color: 'bg-blue-500',
  },
  {
    title: 'Plantões Este Mês',
    value: '8',
    increase: '+2',
    icon: Calendar,
    color: 'bg-green-500',
  },
  {
    title: 'Prontuários',
    value: '1,234',
    increase: '+5%',
    icon: FileText,
    color: 'bg-purple-500',
  },
  {
    title: 'Horas Trabalhadas',
    value: '127h',
    increase: '+8h',
    icon: Clock,
    color: 'bg-orange-500',
  },
]

const recentActivities = [
  {
    id: '1',
    title: 'Plantão UPA 24h',
    description: 'Iniciado às 19:00',
    timeAgo: '2 horas atrás',
    icon: FileText,
  },
  {
    id: '2',
    title: 'Maria Silva Santos',
    description: 'Consulta de rotina',
    timeAgo: '4 horas atrás',
    icon: Users,
  },
  {
    id: '3',
    title: 'João Carlos Oliveira',
    description: 'Prontuário atualizado',
    timeAgo: '6 horas atrás',
    icon: FileText,
  },
]

const weeklyPerformance = [
  { day: 'Seg', hours: 8.5 },
  { day: 'Ter', hours: 9.2 },
  { day: 'Qua', hours: 7.8 },
  { day: 'Qui', hours: 8.9 },
  { day: 'Sex', hours: 8.1 },
  { day: 'Sáb', hours: 6.5 },
  { day: 'Dom', hours: 5.2 },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="card-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {stat.increase}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Próximo plantão e atividade recente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Próximo plantão */}
        <Card className="lg:col-span-2 card-shadow">
          <CardHeader>
            <CardTitle>Próximo Plantão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">UPA 24h - Hospital Municipal</h3>
                <p className="text-sm text-gray-600">Plantão noturno</p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    19:00 - 07:00
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    São Paulo, SP
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  15/08 Amanhã
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Atividade recente */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const Icon = activity.icon
                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Icon className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-500">{activity.timeAgo}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance semanal */}
      <Card className="card-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Performance Semanal</CardTitle>
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-600">Média semanal: 8.5h/dia</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between space-x-2 h-32">
            {weeklyPerformance.map((day) => (
              <div key={day.day} className="flex flex-col items-center space-y-2">
                <div className="w-full bg-gray-200 rounded-t-lg relative">
                  <div
                    className="bg-blue-500 rounded-t-lg transition-all duration-300"
                    style={{ height: `${(day.hours / 10) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-600">{day.day}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
