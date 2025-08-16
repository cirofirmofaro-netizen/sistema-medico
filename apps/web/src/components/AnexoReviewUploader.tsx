import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { 
  Upload, 
  X, 
  Check, 
  FileText, 
  Image, 
  File, 
  Download,
  Trash2,
  Eye
} from 'lucide-react';
import { anexosClient, TempUploadResult, CommitRequest } from '../lib/anexosClient';

interface TempFile {
  file: File;
  key: string;
  previewUrl?: string;
  uploadProgress: number;
  isUploading: boolean;
  isUploaded: boolean;
  error?: string;
}

interface AnexoReviewUploaderProps {
  pacienteId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AnexoReviewUploader({ pacienteId, onSuccess, onCancel }: AnexoReviewUploaderProps) {
  const [tempFiles, setTempFiles] = useState<TempFile[]>([]);
  const [isCommitting, setIsCommitting] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      // Validar arquivo
      const validation = anexosClient.validateFile(file);
      if (!validation.isValid) {
        toast.error(validation.error);
        continue;
      }

      // Adicionar à lista de arquivos temporários
      const tempFile: TempFile = {
        file,
        key: '',
        uploadProgress: 0,
        isUploading: true,
        isUploaded: false,
      };

      setTempFiles(prev => [...prev, tempFile]);

      try {
        // Gerar URL assinada para upload
        const presignResult = await anexosClient.presignTemp(file);
        
        // Fazer upload
        await anexosClient.uploadToSignedUrl(
          presignResult.putUrl,
          file,
          (progress) => {
            setTempFiles(prev => 
              prev.map(tf => 
                tf.file === file 
                  ? { ...tf, uploadProgress: progress }
                  : tf
              )
            );
          }
        );

        // Gerar URL de preview
        const previewResult = await anexosClient.getTempPreviewUrl(presignResult.key);
        
        // Atualizar arquivo com sucesso
        setTempFiles(prev => 
          prev.map(tf => 
            tf.file === file 
              ? { 
                  ...tf, 
                  key: presignResult.key,
                  previewUrl: previewResult.url,
                  uploadProgress: 100,
                  isUploading: false,
                  isUploaded: true,
                }
              : tf
          )
        );

        toast.success(`${file.name} enviado com sucesso!`);
      } catch (error) {
        console.error('Erro no upload:', error);
        setTempFiles(prev => 
          prev.map(tf => 
            tf.file === file 
              ? { 
                  ...tf, 
                  error: 'Erro no upload',
                  isUploading: false,
                }
              : tf
          )
        );
        toast.error(`Erro ao enviar ${file.name}`);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'application/pdf': ['.pdf'],
    },
    multiple: true,
  });

  const removeFile = async (tempFile: TempFile) => {
    if (tempFile.key) {
      try {
        await anexosClient.deleteTemp(tempFile.key);
        toast.success(`${tempFile.file.name} removido`);
      } catch (error) {
        console.error('Erro ao remover arquivo:', error);
        toast.error(`Erro ao remover ${tempFile.file.name}`);
      }
    }

    setTempFiles(prev => prev.filter(tf => tf.file !== tempFile.file));
  };

  const commitFile = async (tempFile: TempFile) => {
    if (!tempFile.isUploaded || !tempFile.key) {
      toast.error('Arquivo não foi enviado completamente');
      return;
    }

    setIsCommitting(true);

    try {
      const commitData: CommitRequest = {
        keyTemp: tempFile.key,
        pacienteId,
        contentType: tempFile.file.type,
        filename: tempFile.file.name,
        size: tempFile.file.size,
      };

      await anexosClient.commitTemp(commitData);
      
      // Remover da lista
      setTempFiles(prev => prev.filter(tf => tf.file !== tempFile.file));
      
      toast.success(`${tempFile.file.name} adicionado ao prontuário!`);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Erro ao confirmar arquivo:', error);
      toast.error(`Erro ao confirmar ${tempFile.file.name}`);
    } finally {
      setIsCommitting(false);
    }
  };

  const renderPreview = (tempFile: TempFile) => {
    if (!tempFile.previewUrl) {
      return (
        <div className="flex items-center justify-center h-32 bg-gray-100 rounded-lg">
          <File className="h-8 w-8 text-gray-400" />
        </div>
      );
    }

    if (tempFile.file.type.startsWith('image/')) {
      return (
        <img
          src={tempFile.previewUrl}
          alt={tempFile.file.name}
          className="max-h-32 object-contain rounded-lg"
        />
      );
    }

    if (tempFile.file.type === 'application/pdf') {
      return (
        <iframe
          src={tempFile.previewUrl}
          className="w-full h-32 rounded-lg border"
          title={tempFile.file.name}
          sandbox="allow-same-origin allow-scripts"
        />
      );
    }

    return (
      <div className="flex items-center justify-center h-32 bg-gray-100 rounded-lg">
        <FileText className="h-8 w-8 text-gray-400" />
      </div>
    );
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-5 w-5" />;
    }
    if (file.type === 'application/pdf') {
      return <FileText className="h-5 w-5" />;
    }
    return <File className="h-5 w-5" />;
  };

  return (
    <div className="space-y-6">
      {/* Área de Upload */}
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
          {isDragActive ? 'Solte os arquivos aqui' : 'Arraste arquivos ou clique para selecionar'}
        </p>
        <p className="text-sm text-gray-500">
          PNG, JPG, PDF (máx. 50MB cada)
        </p>
      </div>

      {/* Lista de Arquivos */}
      {tempFiles.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            Arquivos para revisão ({tempFiles.length})
          </h3>
          
          {tempFiles.map((tempFile, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg p-4 space-y-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getFileIcon(tempFile.file)}
                  <div>
                    <p className="font-medium text-gray-900">{tempFile.file.name}</p>
                    <p className="text-sm text-gray-500">
                      {anexosClient.formatFileSize(tempFile.file.size)} • {tempFile.file.type}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {tempFile.isUploading && (
                    <div className="text-sm text-gray-500">
                      {tempFile.uploadProgress.toFixed(0)}%
                    </div>
                  )}
                  
                  {tempFile.error && (
                    <span className="text-sm text-red-600">{tempFile.error}</span>
                  )}
                  
                  <button
                    onClick={() => removeFile(tempFile)}
                    className="text-red-600 hover:text-red-800 p-1 rounded"
                    title="Remover"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              {tempFile.isUploading && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${tempFile.uploadProgress}%` }}
                  />
                </div>
              )}

              {/* Preview */}
              {tempFile.isUploaded && !tempFile.error && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Prévia:</span>
                    {tempFile.previewUrl && (
                      <a
                        href={tempFile.previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-800 text-sm flex items-center space-x-1"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Abrir</span>
                      </a>
                    )}
                  </div>
                  {renderPreview(tempFile)}
                </div>
              )}

              {/* Actions */}
              {tempFile.isUploaded && !tempFile.error && (
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => commitFile(tempFile)}
                    disabled={isCommitting}
                    className="btn btn-primary flex items-center space-x-2"
                  >
                    <Check className="h-4 w-4" />
                    <span>Confirmar</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            onClick={onCancel}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}
