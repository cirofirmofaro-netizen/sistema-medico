'use client'

import { Badge } from '@/lib/ui/badge'
import { TrendingUp } from 'lucide-react'

export function TopBar() {
  return (
    <div className="flex justify-between items-center p-6 bg-white border-b">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Bem-vindo de volta, Dr. João Silva! Aqui está o resumo do seu dia.</p>
      </div>
      <div className="flex items-center space-x-2">
        <TrendingUp className="w-4 h-4 text-green-500" />
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          Online
        </Badge>
      </div>
    </div>
  )
}
