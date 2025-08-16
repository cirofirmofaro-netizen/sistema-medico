import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Save, X, FileText } from 'lucide-react'

const evolutionSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório'),
  conteudo: z.string().min(1, 'Conteúdo é obrigatório')
})

type EvolutionFormData = z.infer<typeof evolutionSchema>

interface EvolutionEditorProps {
  patientId: string
  evolution?: {
    id: string
    titulo: string
    conteudo: string
  }
  onSave: (data: EvolutionFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function EvolutionEditor({ 
  patientId, 
  evolution, 
  onSave, 
  onCancel, 
  isLoading = false 
}: EvolutionEditorProps) {
  const [isPreview, setIsPreview] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<EvolutionFormData>({
    resolver: zodResolver(evolutionSchema),
    defaultValues: {
      titulo: evolution?.titulo || '',
      conteudo: evolution?.conteudo || ''
    }
  })

  const watchedContent = watch('conteudo')

  const onSubmit = async (data: EvolutionFormData) => {
    try {
      await onSave(data)
      toast.success(evolution ? 'Evolução atualizada!' : 'Evolução criada!')
    } catch (error) {
      toast.error('Erro ao salvar evolução')
    }
  }

  const formatMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>')
      .replace(/\n/g, '<br>')
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          {evolution ? 'Editar Evolução' : 'Nova Evolução'}
        </h3>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setIsPreview(!isPreview)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              isPreview
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isPreview ? 'Editar' : 'Visualizar'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Título */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Título *
          </label>
          <input
            type="text"
            {...register('titulo')}
            className={`input ${errors.titulo ? 'border-red-500' : ''}`}
            placeholder="Ex: Primeira consulta, Retorno, etc."
            disabled={isPreview}
          />
          {errors.titulo && (
            <p className="mt-1 text-sm text-red-600">{errors.titulo.message}</p>
          )}
        </div>

        {/* Conteúdo */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Conteúdo *
          </label>
          
          {isPreview ? (
            <div className="min-h-[300px] p-4 bg-gray-50 rounded-lg border border-gray-200 overflow-y-auto">
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: formatMarkdown(watchedContent || '') 
                }}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <textarea
                {...register('conteudo')}
                rows={12}
                className={`input resize-none ${errors.conteudo ? 'border-red-500' : ''}`}
                placeholder="Descreva a evolução do paciente...
                
Exemplo de formatação:
**Sintomas principais:** Dor abdominal
*Observações:* Paciente relata...
`Exame físico:` Abdome doloroso à palpação"
                disabled={isPreview}
              />
              {errors.conteudo && (
                <p className="text-sm text-red-600">{errors.conteudo.message}</p>
              )}
              
              {/* Markdown Help */}
              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                <p className="font-medium mb-2">Dicas de formatação:</p>
                <ul className="space-y-1">
                  <li><strong>**texto**</strong> para negrito</li>
                  <li><em>*texto*</em> para itálico</li>
                  <li><code>`código`</code> para destacar</li>
                  <li>Quebras de linha são preservadas</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary flex items-center"
            disabled={isSubmitting || isLoading}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary flex items-center"
            disabled={isSubmitting || isLoading}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting || isLoading ? 'Salvando...' : 'Salvar Evolução'}
          </button>
        </div>
      </form>
    </div>
  )
}
