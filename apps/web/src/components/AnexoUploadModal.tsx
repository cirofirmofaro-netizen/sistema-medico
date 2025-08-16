import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { 
  Upload, 
  X, 
  FileText, 
  Image, 
  File, 
  Check,
  AlertCircle
} from 'lucide-react';
import { anexosClient, CommitRequest } from '../lib/anexosClient';

interface AnexoUploadModalProps {
  pacienteId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  isOpen: boolean;
}

interface UploadFile {
  file: File;
  key: string;
  uploadProgress: number;
  isUploading: boolean;
  isUploaded: boolean;
  error?: string;
}

const TIPOS_DOCUMENTO = [
  { value: 'EXAME_LABORATORIAL', label: 'Exame Laboratorial' },
  { value: 'EXAME_IMAGEM', label: 'Exame de Imagem' },
  { value: 'RECEITA', label: 'Receita' },
  { value: 'ATESTADO', label: 'Atestado' },
  { value: 'RELATORIO', label: 'Relatório Médico' },
  { value: 'HISTORICO', label: 'Histórico Clínico' },
  { value: 'CONSENTIMENTO', label: 'Termo de Consentimento' },
  { value: 'OUTROS', label: 'Outros' },
];

export function AnexoUploadModal({ pacienteId, onSuccess, onCancel, isOpen }: AnexoUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadFile, setUploadFile] = useState<UploadFile | null>(null);
  const [titulo, setTitulo] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState('');
  const [observacao, setObservacao] = useState('');
  const [isCommitting, setIsCommitting] = useState(false);
  const [step, setStep] = useState<'select' | 'details' | 'uploading'>('select');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    
    // Validar arquivo
    const validation = anexosClient.validateFile(file);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    setSelectedFile(file);
    setStep('details');
  }, []);

  const handleStartUpload = async () => {
    if (!selectedFile || !titulo.trim() || !tipoDocumento) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setStep('uploading');

    // Inicializar upload
    const uploadFileData: UploadFile = {
      file: selectedFile,
      key: '',
      uploadProgress: 0,
      isUploading: true,
      isUploaded: false,
    };

    setUploadFile(uploadFileData);

    try {
      // Gerar URL assinada para upload
      const presignResult = await anexosClient.presignTemp(selectedFile);
      
      // Fazer upload
      await anexosClient.uploadToSignedUrl(
        presignResult.url,
        selectedFile,
        (progress) => {
          setUploadFile(prev => prev ? { ...prev, uploadProgress: progress } : null);
        }
      );

      // Marcar como enviado
      setUploadFile(prev => prev ? { 
        ...prev, 
        key: presignResult.key,
        uploadProgress: 100,
        isUploading: false,
        isUploaded: true,
      } : null);

      toast.success(`${selectedFile.name} enviado com sucesso!`);
    } catch (error) {
      console.error('Erro no upload:', error);
      setUploadFile(prev => prev ? { 
        ...prev, 
        error: 'Erro no upload',
        isUploading: false,
      } : null);
      toast.error(`Erro ao enviar ${selectedFile.name}`);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'application/pdf': ['.pdf'],
    },
    multiple: false,
  });

  const handleCommit = async () => {
    if (!uploadFile?.isUploaded || !uploadFile.key) {
      toast.error('Arquivo não foi enviado completamente');
      return;
    }

    setIsCommitting(true);

    try {
      const commitData: CommitRequest = {
        keyTemp: uploadFile.key,
        pacienteId,
        tipo: tipoDocumento,
        observacao: observacao.trim() || undefined,
        contentType: uploadFile.file.type,
        filename: titulo.trim(),
        size: uploadFile.file.size,
      };

      await anexosClient.commitTemp(commitData);
      
      toast.success('Anexo adicionado ao prontuário!');
      
      // Resetar modal
      setSelectedFile(null);
      setUploadFile(null);
      setTitulo('');
      setTipoDocumento('');
      setObservacao('');
      setStep('select');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Erro ao confirmar arquivo:', error);
      toast.error('Erro ao adicionar anexo ao prontuário');
    } finally {
      setIsCommitting(false);
    }
  };

  const handleCancel = () => {
    // Resetar modal
    setSelectedFile(null);
    setUploadFile(null);
    setTitulo('');
    setTipoDocumento('');
    setObservacao('');
    setStep('select');
    
    if (onCancel) {
      onCancel();
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-8 w-8 text-blue-500" />;
    }
    if (file.type === 'application/pdf') {
      return <FileText className="h-8 w-8 text-red-500" />;
    }
    return <File className="h-8 w-8 text-gray-500" />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Adicionar Anexo ao Prontuário
          </h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Passo 1: Seleção de Arquivo */}
          {step === 'select' && (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                {isDragActive ? 'Solte o arquivo aqui' : 'Arraste um arquivo ou clique para selecionar'}
              </p>
              <p className="text-sm text-gray-500">
                PNG, JPG, PDF (máx. 50MB)
              </p>
            </div>
          )}

          {/* Passo 2: Detalhes do Documento */}
          {step === 'details' && selectedFile && (
            <div className="space-y-6">
              {/* Arquivo Selecionado */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  {getFileIcon(selectedFile)}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {anexosClient.formatFileSize(selectedFile.size)} • {selectedFile.type}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setStep('select');
                      setTitulo('');
                      setTipoDocumento('');
                      setObservacao('');
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Formulário de Metadados */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título do Documento *
                  </label>
                  <input
                    type="text"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ex: Exame de sangue - Hemograma completo"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Documento *
                  </label>
                  <select
                    value={tipoDocumento}
                    onChange={(e) => setTipoDocumento(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Selecione o tipo de documento</option>
                    {TIPOS_DOCUMENTO.map((tipo) => (
                      <option key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observações
                  </label>
                  <textarea
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                    placeholder="Observações adicionais sobre o documento..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Passo 3: Upload em Progresso */}
          {step === 'uploading' && uploadFile && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  {getFileIcon(uploadFile.file)}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{uploadFile.file.name}</p>
                    <p className="text-sm text-gray-500">
                      {anexosClient.formatFileSize(uploadFile.file.size)} • {uploadFile.file.type}
                    </p>
                  </div>
                  {uploadFile.isUploaded && (
                    <Check className="h-5 w-5 text-green-500" />
                  )}
                  {uploadFile.error && (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>

                {/* Progress Bar */}
                {uploadFile.isUploading && (
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadFile.uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {uploadFile.uploadProgress.toFixed(0)}% enviado
                    </p>
                  </div>
                )}

                {uploadFile.error && (
                  <p className="text-sm text-red-600 mt-2">{uploadFile.error}</p>
                )}
              </div>

              {/* Formulário de Metadados */}
              {uploadFile.isUploaded && !uploadFile.error && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título do Documento *
                    </label>
                    <input
                      type="text"
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      placeholder="Ex: Exame de sangue - Hemograma completo"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Documento *
                    </label>
                    <select
                      value={tipoDocumento}
                      onChange={(e) => setTipoDocumento(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Selecione o tipo de documento</option>
                      {TIPOS_DOCUMENTO.map((tipo) => (
                        <option key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Observações
                    </label>
                    <textarea
                      value={observacao}
                      onChange={(e) => setObservacao(e.target.value)}
                      placeholder="Observações adicionais sobre o documento..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancelar
            </button>
            
            {/* Botão para voltar ao passo anterior */}
            {step === 'details' && (
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setStep('select');
                  setTitulo('');
                  setTipoDocumento('');
                  setObservacao('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Voltar
              </button>
            )}
            
            {/* Botão para iniciar upload */}
            {step === 'details' && (
              <button
                onClick={handleStartUpload}
                disabled={!titulo.trim() || !tipoDocumento}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Fazer Upload
              </button>
            )}
            
            {/* Botão para confirmar após upload */}
            {step === 'uploading' && uploadFile?.isUploaded && !uploadFile.error && (
              <button
                onClick={handleCommit}
                disabled={isCommitting}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCommitting ? 'Adicionando...' : 'Adicionar ao Prontuário'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
