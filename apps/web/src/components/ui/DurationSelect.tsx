import { Clock } from 'lucide-react'

interface DurationSelectProps {
  value: number
  onChange: (duration: number) => void
  label?: string
  error?: string
  placeholder?: string
  className?: string
}

const durationOptions = [
  { value: 15, label: '15 minutos' },
  { value: 30, label: '30 minutos' },
  { value: 45, label: '45 minutos' },
  { value: 60, label: '1 hora' },
  { value: 90, label: '1 hora e 30 minutos' },
  { value: 120, label: '2 horas' },
  { value: 180, label: '3 horas' },
  { value: 240, label: '4 horas' },
]

export default function DurationSelect({
  value,
  onChange,
  label,
  error,
  placeholder = "Selecione a duração",
  className = ""
}: DurationSelectProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <Clock className="h-4 w-4 inline mr-1" />
          {label}
        </label>
      )}
      
      <select
        value={value || ''}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {durationOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
