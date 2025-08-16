import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, User, X } from 'lucide-react'
import { patientsService, Patient } from '../../services/patients'

interface PatientAutocompleteProps {
  value: string
  onChange: (patientId: string) => void
  onPatientSelect?: (patient: Patient) => void
  label?: string
  error?: string
  placeholder?: string
  className?: string
}

export default function PatientAutocomplete({
  value,
  onChange,
  onPatientSelect,
  label,
  error,
  placeholder = "Buscar paciente...",
  className = ""
}: PatientAutocompleteProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Query para buscar pacientes
  const { data: patients, isLoading } = useQuery({
    queryKey: ['patients', 'search', searchTerm],
    queryFn: () => patientsService.listPatients({ q: searchTerm, limit: 10 }),
    enabled: searchTerm.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  // Debounce para busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(inputRef.current?.value || '')
    }, 300)

    return () => clearTimeout(timer)
  }, [inputRef.current?.value])

  // Buscar paciente selecionado quando value mudar
  useEffect(() => {
    if (value && !selectedPatient) {
      patientsService.getPatient(value).then(patient => {
        setSelectedPatient(patient)
      }).catch(() => {
        // Paciente não encontrado, limpar seleção
        setSelectedPatient(null)
      })
    }
  }, [value, selectedPatient])

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient)
    onChange(patient.id)
    onPatientSelect?.(patient)
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleClear = () => {
    setSelectedPatient(null)
    onChange('')
    onPatientSelect?.(undefined as any)
    setSearchTerm('')
    setIsOpen(false)
  }

     const formatPatientName = (patient: Patient) => {
     const age = patient.dtNasc 
       ? new Date().getFullYear() - new Date(patient.dtNasc).getFullYear()
       : null
     
     return `${patient.nome}${age ? ` (${age} anos)` : ''}`
   }

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        {selectedPatient ? (
          // Paciente selecionado
          <div className="flex items-center justify-between p-3 border border-gray-300 rounded-lg bg-gray-50">
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">{formatPatientName(selectedPatient)}</p>
                {selectedPatient.telefone && (
                  <p className="text-sm text-gray-500">{selectedPatient.telefone}</p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          // Campo de busca
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
              onFocus={() => setIsOpen(true)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        )}

        {/* Dropdown de resultados */}
        {isOpen && !selectedPatient && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                Buscando pacientes...
              </div>
            ) : patients?.pacientes && patients.pacientes.length > 0 ? (
              <div className="py-1">
                                 {patients.pacientes.map((patient) => (
                  <button
                    key={patient.id}
                    type="button"
                    onClick={() => handlePatientSelect(patient)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                  >
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{formatPatientName(patient)}</p>
                        {patient.telefone && (
                          <p className="text-sm text-gray-500">{patient.telefone}</p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : searchTerm.length >= 2 ? (
              <div className="p-4 text-center text-gray-500">
                Nenhum paciente encontrado
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                Digite pelo menos 2 caracteres para buscar
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
