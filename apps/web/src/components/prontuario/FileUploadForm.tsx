import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { X, Upload, FileText, Image, File, Trash2 } from 'lucide-react'
import { filesService } from '../../services/medicalRecords'

const TIPOS_DOCUMENTO = [
  { value: 'exame', label: 'Resultado de Exame' },
  { value: 'receita', label: 'Receita Médica' },
  { value: 'atestado', label: 'Atestado' },
  { value: 'laudo', label: 'Laudo Médico' },
  { value: 'imagem', label: 'Imagem/Laudo de Imagem' },
  { value: 'consentimento', label: 'Termo de Consentimento' },
  { value: 'outro', label: 'Outro' }
]

interface FileUploadFormProps {
  patientId: string
  onSuccess: () => void
  onCancel: () => void
}

interface FileWithMetadata {
  file: File
  titulo: string
  tipoDocumento: string
}

export default function FileUploadForm({ patientId, onSuccess, onCancel }: FileUploadFormProps) {
  const [selectedFiles, setSelectedFiles] = useState<FileWithMetadata[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const filesWithMetadata: FileWithMetadata[] = files.map(file => ({
      file,
      titulo: file.name.replace(/\.[^/.]+$/, ''), // Remove extensão
      tipoDocumento: 'outro'
    }))
    setSelectedFiles(prev => [...prev, ...filesWithMetadata])
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const updateFileMetadata = (index: number, field: keyof FileWithMetadata, value: string) => {
    setSelectedFiles(prev => prev.map((file, i) => 
      i === index ? { ...file, [field]: value } : file
    ))
  }

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const { file, titulo, tipoDocumento } = selectedFiles[i]

        // Upload do arquivo usando o service
        await filesService.uploadFile({
          patientId,
          file,
          titulo,
          tipoDocumento
        })

        setUploadProgress(((i + 1) / selectedFiles.length) * 100)
      }

      toast.success('Arquivos enviados com sucesso!')
      setSelectedFiles([])
      onSuccess()
    } catch (error) {
      toast.error('Erro ao enviar arquivos')
      console.error(error)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️'
    if (type === 'application/pdf') return '📄'
    if (type === 'text/plain') return '📝'
    return '📎'
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Upload className="h-6 w-6 text-primary-600" />
            <h2 className="text-xl font-bold text-gray-900">Upload de Arquivos</h2>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Área de Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Arraste arquivos aqui ou clique para selecionar
            </p>
            <p className="text-sm text-gray-500 mb-4">
              PDF, JPG, PNG, GIF até 10MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.gif,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Selecionar Arquivos
            </button>
          </div>

          {/* Lista de Arquivos Selecionados */}
          {selectedFiles.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Arquivos Selecionados</h3>
              <div className="space-y-4">
                {selectedFiles.map((fileInfo, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <File className="h-8 w-8 text-primary-600" />
                        <div>
                          <p className="font-medium text-gray-900">{fileInfo.file.name}</p>
                          <p className="text-sm text-gray-500">
                            {(fileInfo.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Campos de metadados */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Título do Documento *
                        </label>
                        <input
                          type="text"
                          value={fileInfo.titulo}
                          onChange={(e) => updateFileMetadata(index, 'titulo', e.target.value)}
                          placeholder="Ex: Exame de sangue - Hemograma"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tipo de Documento
                        </label>
                        <select
                          value={fileInfo.tipoDocumento}
                          onChange={(e) => updateFileMetadata(index, 'tipoDocumento', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                          {TIPOS_DOCUMENTO.map(tipo => (
                            <option key={tipo.value} value={tipo.value}>
                              {tipo.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Barra de Progresso */}
          {isUploading && (
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Enviando arquivos...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
            <button
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={uploadFiles}
              disabled={isUploading || selectedFiles.length === 0}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>{isUploading ? 'Enviando...' : 'Enviar Arquivos'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
