import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { X, DollarSign, Calendar, CreditCard, FileText } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { plantoesService } from '../../../services/plantoes'
import MaskedInput from '../../../components/ui/MaskedInput'
import DatePicker from '../../../components/ui/DatePicker'
import Select from '../../../components/ui/Select'

const paymentSchema = z.object({
  valorPago: z.string().min(1, 'Valor é obrigatório'),
  dtPgto: z.string().min(1, 'Data de pagamento é obrigatória'),
  formaPagamento: z.string().min(1, 'Forma de pagamento é obrigatória'),
  obs: z.string().optional(),
})

type PaymentFormData = z.infer<typeof paymentSchema>

interface PaymentDialogProps {
  open: boolean
  plantaoId: string
  valorTotal: number
  onClose: () => void
  onSuccess: () => void
}

export default function PaymentDialog({ 
  open, 
  plantaoId, 
  valorTotal, 
  onClose, 
  onSuccess 
}: PaymentDialogProps) {
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      dtPgto: new Date().toISOString().split('T')[0],
      formaPagamento: '',
      obs: '',
    }
  })

  const valorPago = watch('valorPago')

  const createPaymentMutation = useMutation({
    mutationFn: async (data: PaymentFormData) => {
      const valorNumerico = parseFloat(data.valorPago.replace(/[^\d,]/g, '').replace(',', '.'))
      return plantoesService.registrarPagamento(plantaoId, {
        valorPago: valorNumerico,
        dtPgto: new Date(data.dtPgto).toISOString(),
        formaPagamento: data.formaPagamento,
        obs: data.obs,
      })
    },
    onSuccess: () => {
      toast.success('Pagamento registrado com sucesso!')
      reset()
      onSuccess()
    },
    onError: () => {
      toast.error('Erro ao registrar pagamento')
    }
  })

  const onSubmit = async (data: PaymentFormData) => {
    setIsSubmitting(true)
    try {
      await createPaymentMutation.mutateAsync(data)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      reset()
      onClose()
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Registrar Pagamento</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Valor Total do Plantão */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600 font-medium">Valor Total do Plantão</p>
            <p className="text-2xl font-bold text-blue-900">
              R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Valor Pago */}
          <div>
            <MaskedInput
              mask="currency"
              value={valorPago}
              onChange={(value) => setValue('valorPago', value)}
              label="Valor Pago (R$)"
              error={errors.valorPago?.message}
              placeholder="0,00"
            />
          </div>

          {/* Data de Pagamento */}
          <div>
            <DatePicker
              value={watch('dtPgto')}
              onChange={(value) => setValue('dtPgto', value)}
              label="Data de Pagamento"
              error={errors.dtPgto?.message}
            />
          </div>

          {/* Forma de Pagamento */}
          <div>
            <Select
              value={watch('formaPagamento')}
              onChange={(value) => setValue('formaPagamento', value)}
              options={[
                { value: 'PIX', label: 'PIX' },
                { value: 'TED', label: 'TED' },
                { value: 'ESPECIE', label: 'Espécie' },
                { value: 'CARTAO', label: 'Cartão' },
                { value: 'OUTRO', label: 'Outro' },
              ]}
              label="Forma de Pagamento"
              error={errors.formaPagamento?.message}
              placeholder="Selecione a forma de pagamento"
            />
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FileText className="h-4 w-4 inline mr-1" />
              Observações (opcional)
            </label>
            <textarea
              {...register('obs')}
              rows={3}
              placeholder="Observações sobre o pagamento..."
              className="input resize-none"
            />
            {errors.obs && (
              <p className="mt-1 text-sm text-red-600">{errors.obs.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Registrando...
                </div>
              ) : (
                'Registrar Pagamento'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
