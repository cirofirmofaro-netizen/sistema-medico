import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, FileText, Image, File, Check, X, Download } from 'lucide-react';
import { toast } from 'sonner';
import { anexosClient, TempUploadResult, TempPreviewResult, CommitRequest } from '@/lib/anexosClient';

interface FileWithPreview {
  file: File;
  key: string;
  previewUrl?: string;
  uploadProgress: number;
  uploadStatus: 'pending' | 'uploading' | 'uploaded' | 'error';
  error?: string;
  titulo: string;
  tipoDocumento: string;
}

interface AnexoReviewUploaderProps {
  pacienteId: string;
  onUploadComplete?: () => void;
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

export function AnexoReviewUploader({ pacienteId, onUploadComplete }: AnexoReviewUploaderProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles: FileWithPreview[] = [];

    for (const file of acceptedFiles) {
      // Validar arquivo
      const validation = anexosClient.validateFile(file);
      if (!validation.isValid) {
        toast.error(validation.error);
        continue;
      }

      const fileWithPreview: FileWithPreview = {
        file,
        key: '',
        uploadProgress: 0,
        uploadStatus: 'pending',
        titulo: file.name,
        tipoDocumento: 'Outros'
      };

      newFiles.push(fileWithPreview);
    }

    setFiles(prev => [...prev, ...newFiles]);

    // Processar uploads
    for (let i = 0; i < newFiles.length; i++) {
      const fileIndex = files.length + i;
      await processFileUpload(fileIndex);
    }
  }, [files]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'application/pdf': ['.pdf']
    },
    multiple: true
  });

  const processFileUpload = async (fileIndex: number) => {
    const fileWithPreview = files[fileIndex];
    if (!fileWithPreview) return;

    try {
      // Atualizar status para uploading
      setFiles(prev => prev.map((f, i) => 
        i === fileIndex ? { ...f, uploadStatus: 'uploading' } : f
      ));

      // Gerar URL assinada
      const presignResult: TempUploadResult = await anexosClient.presignTemp(fileWithPreview.file);

      // Atualizar com a chave
      setFiles(prev => prev.map((f, i) => 
        i === fileIndex ? { ...f, key: presignResult.key } : f
      ));

      // Fazer upload
      await anexosClient.uploadToSignedUrl(
        presignResult.url,
        fileWithPreview.file,
        (progress) => {
          setFiles(prev => prev.map((f, i) => 
            i === fileIndex ? { ...f, uploadProgress: progress } : f
          ));
        }
      );

      // Gerar URL de preview
      const previewResult: TempPreviewResult = await anexosClient.getTempPreviewUrl(presignResult.key);

      // Atualizar com preview e status
      setFiles(prev => prev.map((f, i) => 
        i === fileIndex ? { 
          ...f, 
          previewUrl: previewResult.url,
          uploadStatus: 'uploaded',
          uploadProgress: 100
        } : f
      ));

    } catch (error) {
      console.error('Erro no upload:', error);
      setFiles(prev => prev.map((f, i) => 
        i === fileIndex ? { 
          ...f, 
          uploadStatus: 'error',
          error: error instanceof Error ? error.message : 'Erro no upload'
        } : f
      ));
      toast.error(`Erro ao fazer upload de ${fileWithPreview.file.name}`);
    }
  };

  const removeFile = async (fileIndex: number) => {
    const fileWithPreview = files[fileIndex];
    
    if (fileWithPreview.key && fileWithPreview.uploadStatus === 'uploaded') {
      try {
        await anexosClient.deleteTemp(fileWithPreview.key);
      } catch (error) {
        console.error('Erro ao deletar arquivo temporário:', error);
      }
    }

    setFiles(prev => prev.filter((_, i) => i !== fileIndex));
  };

  const commitFile = async (fileIndex: number) => {
    const fileWithPreview = files[fileIndex];
    
    if (!fileWithPreview.key || fileWithPreview.uploadStatus !== 'uploaded') {
      toast.error('Arquivo não está pronto para confirmação');
      return;
    }

    if (!fileWithPreview.titulo.trim()) {
      toast.error('Título é obrigatório');
      return;
    }

    setIsUploading(true);

    try {
      const commitData: CommitRequest = {
        keyTemp: fileWithPreview.key,
        pacienteId,
        tipo: fileWithPreview.titulo,
        observacao: fileWithPreview.tipoDocumento,
        contentType: fileWithPreview.file.type,
        filename: fileWithPreview.file.name,
        size: fileWithPreview.file.size,
      };

      await anexosClient.commitTemp(commitData);

      // Remover arquivo da lista
      setFiles(prev => prev.filter((_, i) => i !== fileIndex));
      
      toast.success('Anexo adicionado ao prontuário com sucesso!');
      onUploadComplete?.();

    } catch (error) {
      console.error('Erro ao confirmar upload:', error);
      toast.error('Erro ao confirmar upload');
    } finally {
      setIsUploading(false);
    }
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

  const renderPreview = (fileWithPreview: FileWithPreview) => {
    if (!fileWithPreview.previewUrl) return null;

    if (fileWithPreview.file.type.startsWith('image/')) {
      return (
        <img
          src={fileWithPreview.previewUrl}
          alt={fileWithPreview.file.name}
          className="max-h-64 object-contain rounded border"
        />
      );
    } else if (fileWithPreview.file.type === 'application/pdf') {
      return (
        <iframe
          src={fileWithPreview.previewUrl}
          className="w-full h-64 border rounded"
          title={fileWithPreview.file.name}
          sandbox="allow-same-origin allow-scripts"
        />
      );
    } else {
      return (
        <div className="flex items-center justify-center h-32 border rounded bg-gray-50">
          <div className="text-center">
            <File className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">{fileWithPreview.file.name}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => window.open(fileWithPreview.previewUrl, '_blank')}
            >
              <Download className="h-4 w-4 mr-1" />
              Baixar
            </Button>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Área de Drop */}
      <Card>
        <CardHeader>
          <CardTitle>Upload de Arquivos</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <File className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-lg text-blue-600">Solte os arquivos aqui...</p>
            ) : (
              <div>
                <p className="text-lg text-gray-600 mb-2">
                  Arraste e solte arquivos aqui, ou clique para selecionar
                </p>
                <p className="text-sm text-gray-500">
                  Suportado: PNG, JPG, PDF (máx. 50MB)
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Arquivos */}
      {files.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Arquivos para Revisão</h3>
          
          {files.map((fileWithPreview, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  {/* Ícone e Info Básica */}
                  <div className="flex-shrink-0">
                    {getFileIcon(fileWithPreview.file)}
                  </div>

                  {/* Conteúdo Principal */}
                  <div className="flex-1 space-y-4">
                    {/* Header com nome e status */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{fileWithPreview.file.name}</h4>
                        <p className="text-sm text-gray-500">
                          {anexosClient.formatFileSize(fileWithPreview.file.size)} • {fileWithPreview.file.type}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {fileWithPreview.uploadStatus === 'error' && (
                          <span className="text-red-500 text-sm">Erro</span>
                        )}
                        {fileWithPreview.uploadStatus === 'uploaded' && (
                          <span className="text-green-500 text-sm flex items-center">
                            <Check className="h-4 w-4 mr-1" />
                            Pronto
                          </span>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFile(index)}
                          disabled={fileWithPreview.uploadStatus === 'uploading'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {fileWithPreview.uploadStatus === 'uploading' && (
                      <div className="space-y-2">
                        <Progress value={fileWithPreview.uploadProgress} />
                        <p className="text-sm text-gray-500">
                          Fazendo upload... {Math.round(fileWithPreview.uploadProgress)}%
                        </p>
                      </div>
                    )}

                    {/* Error Message */}
                    {fileWithPreview.uploadStatus === 'error' && fileWithPreview.error && (
                      <div className="bg-red-50 border border-red-200 rounded p-3">
                        <p className="text-red-700 text-sm">{fileWithPreview.error}</p>
                      </div>
                    )}

                    {/* Preview */}
                    {fileWithPreview.uploadStatus === 'uploaded' && (
                      <div className="space-y-4">
                        {renderPreview(fileWithPreview)}
                        
                        {/* Campos de Metadados */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`titulo-${index}`}>Título *</Label>
                            <Input
                              id={`titulo-${index}`}
                              value={fileWithPreview.titulo}
                              onChange={(e) => setFiles(prev => prev.map((f, i) => 
                                i === index ? { ...f, titulo: e.target.value } : f
                              ))}
                              placeholder="Ex: Resultado de Hemograma"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor={`tipo-${index}`}>Tipo de Documento</Label>
                            <Select
                              value={fileWithPreview.tipoDocumento}
                              onValueChange={(value) => setFiles(prev => prev.map((f, i) => 
                                i === index ? { ...f, tipoDocumento: value } : f
                              ))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {DOCUMENT_TYPES.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Botão Confirmar */}
                        <div className="flex justify-end">
                          <Button
                            onClick={() => commitFile(index)}
                            disabled={isUploading || !fileWithPreview.titulo.trim()}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {isUploading ? 'Confirmando...' : 'Confirmar e Adicionar ao Prontuário'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
