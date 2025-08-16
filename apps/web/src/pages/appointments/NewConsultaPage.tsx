import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, Calendar, Clock, MapPin, User, Video, Monitor } from 'lucide-react'
import { appointmentsService, CreateAppointmentData } from '../../services/appointments'
import { Patient } from '../../services/patients'
import PatientAutocomplete from '../../components/ui/PatientAutocomplete'
import DurationSelect from '../../components/ui/DurationSelect'
import Select from '../../components/ui/Select'

const consultaSchema = z.object({
  patientId: z.string().min(1, 'Paciente é obrigatório'),
  data: z.string().min(1, 'Data é obrigatória'),
  horaInicio: z.string().min(1, 'Hora de início é obrigatória'),
  duracao: z.number().min(1, 'Duração é obrigatória'),
  tipo: z.enum(['PRESENCIAL', 'TELEMEDICINA']),
  local: z.string().min(1, 'Local é obrigatório'),
  observacoes: z.string().optional(),
  horaFim: z.string().optional(),
})

type ConsultaFormData = z.infer<typeof consultaSchema>

export default function NewConsultaPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<ConsultaFormData>({
    resolver: zodResolver(consultaSchema),
    defaultValues: {
      data: new Date().toISOString().split('T')[0],
      duracao: 60,
      tipo: 'PRESENCIAL',
    }
  })

  const data = watch('data')
  const horaInicio = watch('horaInicio')
  const duracao = watch('duracao')

  // Calcular hora fim automaticamente
  useEffect(() => {
    if (data && horaInicio && duracao) {
      const inicio = new Date(`${data}T${horaInicio}`)
      const fim = new Date(inicio.getTime() + duracao * 60 * 1000)
      const horaFim = fim.toTimeString().slice(0, 5)
      setValue('horaFim', horaFim)
    }
  }, [data, horaInicio, duracao, setValue])

  // Preencher paciente se passado na URL
  useEffect(() => {
    const patientId = searchParams.get('patientId')
    if (patientId) {
      setValue('patientId', patientId)
    }
  }, [searchParams, setValue])

  const createMutation = useMutation({
    mutationFn: appointmentsService.createAppointment,
    onSuccess: () => {
      toast.success('Consulta agendada com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      navigate('/appointments')
    },
    onError: (error: any) => {
      if (error.response?.data?.message?.includes('conflito')) {
        toast.error('Conflito de horário: já existe uma consulta neste período')
      } else {
        toast.error('Erro ao agendar consulta')
      }
    }
  })

  const onSubmit = async (formData: ConsultaFormData) => {
    setIsSubmitting(true)
    try {
      // Calcular hora fim
      const inicio = new Date(`${formData.data}T${formData.horaInicio}`)
      const fim = new Date(inicio.getTime() + formData.duracao * 60 * 1000)
      const horaFim = fim.toTimeString().slice(0, 5)
      
      await createMutation.mutateAsync({
        ...formData,
        horaFim,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient)
  }

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/appointments')}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nova Consulta</h1>
            <p className="text-gray-600">Agende uma nova consulta</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Paciente */}
          <PatientAutocomplete
            value={watch('patientId')}
            onChange={(patientId) => setValue('patientId', patientId)}
            onPatientSelect={handlePatientSelect}
            label="Paciente"
            error={errors.patientId?.message}
            placeholder="Buscar paciente por nome..."
          />

          {/* Data e Horários */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Data
              </label>
              <input
                {...register('data')}
                type="date"
                className="input"
              />
              {errors.data && (
                <p className="mt-1 text-sm text-red-600">{errors.data.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Clock className="h-4 w-4 inline mr-1" />
                Hora Início
              </label>
              <input
                {...register('horaInicio')}
                type="time"
                className="input"
              />
              {errors.horaInicio && (
                <p className="mt-1 text-sm text-red-600">{errors.horaInicio.message}</p>
              )}
            </div>

            <DurationSelect
              value={duracao}
              onChange={(value) => setValue('duracao', value)}
              label="Duração"
              error={errors.duracao?.message}
            />
          </div>

          {/* Hora Fim (somente leitura) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Clock className="h-4 w-4 inline mr-1" />
              Hora Fim
            </label>
            <input
              type="time"
              value={data && horaInicio && duracao ? (() => {
                const inicio = new Date(`${data}T${horaInicio}`)
                const fim = new Date(inicio.getTime() + duracao * 60 * 1000)
                return fim.toTimeString().slice(0, 5)
              })() : ''}
              className="input bg-gray-50"
              readOnly
            />
          </div>

          {/* Tipo e Local */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              value={watch('tipo')}
              onChange={(value) => setValue('tipo', value as 'PRESENCIAL' | 'TELEMEDICINA')}
              options={[
                { value: 'PRESENCIAL', label: 'Presencial' },
                { value: 'TELEMEDICINA', label: 'Telemedicina' },
              ]}
              label="Tipo de Consulta"
              error={errors.tipo?.message}
            />

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <MapPin className="h-4 w-4 inline mr-1" />
                Local
              </label>
              <input
                {...register('local')}
                type="text"
                className="input"
                placeholder="Local da consulta"
              />
              {errors.local && (
                <p className="mt-1 text-sm text-red-600">{errors.local.message}</p>
              )}
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              {...register('observacoes')}
              rows={3}
              className="input"
              placeholder="Observações adicionais..."
            />
            {errors.observacoes && (
              <p className="mt-1 text-sm text-red-600">{errors.observacoes.message}</p>
            )}
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/appointments')}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Agendando...' : 'Agendar Consulta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
