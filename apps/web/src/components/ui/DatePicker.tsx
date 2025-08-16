import React, { useState } from 'react'
import { Calendar, X } from 'lucide-react'

interface DatePickerProps {
  value: string
  onChange: (value: string) => void
  label?: string
  error?: string
  placeholder?: string
  className?: string
}

export default function DatePicker({ 
  value, 
  onChange, 
  label, 
  error, 
  placeholder = 'dd/mm/aaaa',
  className = '' 
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type="date"
          value={value}
          onChange={handleDateChange}
          className={`input pr-10 ${error ? 'border-red-500' : ''} ${className}`}
          placeholder={placeholder}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <Calendar className="h-4 w-4 text-gray-400" />
        </div>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
