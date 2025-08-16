import React, { useState, useEffect } from 'react';
import { FileText, Image, File, Download, AlertTriangle, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { anexosClient, CommitRequest } from '../lib/anexosClient';

interface AnexoConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: File | null;
  pacienteId: string;
  onConfirm: () => void;
}

const DOCUMENT_TYPES = [
  'Resultado de Exame',
  'Prescrição Médica',
  'Relatório Médico',
  'Laudo',
  'Receita',
  'Atestado',
  'Solicitação de Exame',
  'Histórico Médico',
  'Outros'
];

export function AnexoConfirmModal({ 
  isOpen, 
  onClose, 
  file, 
  pacienteId, 
  onConfirm 
}: AnexoConfirmModalProps) {
  const [titulo, setTitulo] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState('Outros');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [tempKey, setTempKey] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewBlocked, setPreviewBlocked] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && file) {
      setTitulo(file.name);
      setTipoDocumento('Outros');
      setPreviewUrl(null);
      setUploadProgress(0);
      setTempKey(null);
      setUploadError(null);
      setPreviewBlocked(false);
      
      // Start upload process
      handleFileUpload();
    }
  }, [isOpen, file]);

  const handleFileUpload = async () => {
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadError(null);

      console.log('🔄 Iniciando upload do arquivo:', file.name);

      // 1. Gerar URL assinada
      console.log('📝 Gerando URL assinada...');
      const presignResult = await anexosClient.presignTemp(file);
      setTempKey(presignResult.key);
      console.log('✅ URL assinada gerada:', presignResult.key);

      // 2. Fazer upload
      console.log('📤 Fazendo upload...');
      await anexosClient.uploadToSignedUrl(
        presignResult.url,
        file,
        (progress) => {
          setUploadProgress(progress);
          console.log('📊 Progresso:', progress + '%');
        }
      );
      console.log('✅ Upload concluído');

      // 3. Gerar URL de preview
      console.log('🖼️ Gerando preview...');
      const previewResult = await anexosClient.getTempPreviewUrl(presignResult.key);
      setPreviewUrl(previewResult.url);
      console.log('✅ Preview gerado:', previewResult.url);

    } catch (error) {
      console.error('❌ Erro no upload:', error);
      setUploadError(error instanceof Error ? error.message : 'Erro desconhecido');
      toast.error('Erro ao fazer upload do arquivo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirm = async () => {
    if (!tempKey || !file || !titulo.trim()) {
      toast.error('Dados incompletos para confirmação');
      return;
    }

    if (!previewUrl) {
      toast.error('Preview não disponível. Aguarde o upload ser concluído.');
      return;
    }

    try {
      setIsLoading(true);

      const commitData: CommitRequest = {
        keyTemp: tempKey,
        pacienteId,
        tipo: titulo,
        observacao: tipoDocumento,
        contentType: file.type,
        filename: file.name,
        size: file.size,
      };

      await anexosClient.commitTemp(commitData);
      
      toast.success('Anexo adicionado ao prontuário com sucesso!');
      onConfirm();
      onClose();

    } catch (error) {
      console.error('Erro ao confirmar upload:', error);
      toast.error('Erro ao confirmar upload');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (tempKey) {
      try {
        await anexosClient.deleteTemp(tempKey);
      } catch (error) {
        console.error('Erro ao deletar arquivo temporário:', error);
      }
    }
    onClose();
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-8 w-8 text-blue-500" />;
    } else if (file.type === 'application/pdf') {
      return <FileText className="h-8 w-8 text-red-500" />;
    } else {
      return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  const renderPreview = () => {
    if (!file || !previewUrl) return null;

    if (file.type.startsWith('image/')) {
      return (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Preview do Arquivo:</label>
          <div className="relative">
            <img
              src={previewUrl}
              alt={file.name}
              className="max-h-64 object-contain rounded border mx-auto"
              onError={(e) => {
                console.error('Erro ao carregar imagem:', e);
                setPreviewBlocked(true);
                toast.error('Preview bloqueado pelo navegador. Use o botão "Abrir" para visualizar.');
              }}
              onLoad={() => setPreviewBlocked(false)}
            />
            <div className="absolute top-2 right-2">
              <button
                type="button"
                className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => window.open(previewUrl, '_blank')}
              >
                Abrir
              </button>
            </div>
          </div>
          {previewBlocked && (
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ Preview bloqueado:</strong> O navegador bloqueou o preview por segurança. 
                Clique em "Abrir" para visualizar o arquivo em uma nova aba.
              </p>
            </div>
          )}
        </div>
      );
    } else if (file.type === 'application/pdf') {
      return (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Preview do Arquivo:</label>
          <div className="relative">
            <iframe
              src={previewUrl}
              className="w-full h-64 border rounded"
              title={file.name}
              sandbox="allow-same-origin allow-scripts"
              onError={(e) => {
                console.error('Erro ao carregar PDF:', e);
                setPreviewBlocked(true);
                toast.error('Preview bloqueado pelo navegador. Use o botão "Abrir" para visualizar.');
              }}
              onLoad={() => setPreviewBlocked(false)}
            />
            <div className="absolute top-2 right-2">
              <button
                type="button"
                className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => window.open(previewUrl, '_blank')}
              >
                Abrir
              </button>
            </div>
          </div>
          {previewBlocked && (
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ Preview bloqueado:</strong> O navegador bloqueou o preview por segurança. 
                Clique em "Abrir" para visualizar o PDF em uma nova aba.
              </p>
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Arquivo:</label>
          <div className="flex items-center justify-center h-32 border rounded bg-gray-50">
            <div className="text-center">
              <File className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">{file.name}</p>
              <button
                type="button"
                className="mt-2 px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                onClick={() => window.open(previewUrl, '_blank')}
              >
                <Download className="h-4 w-4 inline mr-1" />
                Baixar
              </button>
            </div>
          </div>
        </div>
      );
    }
  };

  if (!file || !isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6 text-orange-500" />
            <h2 className="text-xl font-bold text-gray-900">Confirmar Anexo ao Prontuário</h2>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading || isUploading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Informações do Arquivo */}
          <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0">
              {getFileIcon(file)}
            </div>
            <div className="flex-1">
              <h4 className="font-medium">{file.name}</h4>
              <p className="text-sm text-gray-500">
                {anexosClient.formatFileSize(file.size)} • {file.type}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                <strong>⚠️ Importante:</strong> Este arquivo será adicionado ao prontuário do paciente 
                e seguirá a política de retenção de 20 anos. Confirme se é o arquivo correto.
              </p>
            </div>
          </div>

          {/* Progress de Upload */}
          {isUploading && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Loader2 className="h-4 w-4 animate-spin" />
                Fazendo upload...
              </label>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500">{Math.round(uploadProgress)}%</p>
            </div>
          )}

          {/* Erro de Upload */}
          {uploadError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-red-800">Erro no Upload</h4>
                  <p className="text-sm text-red-700 mt-1">{uploadError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Preview */}
          {previewUrl && !isUploading && (
            <div className="space-y-2">
              <label className="text-green-600 font-medium text-sm">✅ Preview Disponível</label>
              {renderPreview()}
            </div>
          )}

          {/* Campos de Metadados */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-2">
                Título do Documento *
              </label>
              <input
                id="titulo"
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Resultado de Hemograma"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Documento
              </label>
              <select
                id="tipo"
                value={tipoDocumento}
                onChange={(e) => setTipoDocumento(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {DOCUMENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Aviso Final */}
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-orange-800">Confirmação Final</h4>
                <p className="text-sm text-orange-700 mt-1">
                  Você está prestes a adicionar este arquivo ao prontuário do paciente. 
                  Após a confirmação, o arquivo será permanentemente associado ao prontuário 
                  e seguirá a política de retenção de dados médicos.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading || isUploading}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading || isUploading || !titulo.trim() || !previewUrl || !!uploadError}
            className="btn btn-primary bg-green-600 hover:bg-green-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Confirmando...
              </>
            ) : (
              'Confirmar e Adicionar ao Prontuário'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
