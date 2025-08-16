import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { File, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { anexosClient } from '../lib/anexosClient';
import { AnexoConfirmModal } from './AnexoConfirmModal';

interface SimpleAnexoUploaderProps {
  pacienteId: string;
  onUploadComplete?: () => void;
}

export function SimpleAnexoUploader({ pacienteId, onUploadComplete }: SimpleAnexoUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];

    // Validar arquivo
    const validation = anexosClient.validateFile(file);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    // Abrir modal de confirmação
    setSelectedFile(file);
    setIsModalOpen(true);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'application/pdf': ['.pdf']
    },
    multiple: false
  });

  const handleConfirm = () => {
    onUploadComplete?.();
    setSelectedFile(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
  };

  return (
    <>
      {/* Botão de Upload */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        {isDragActive ? (
          <p className="text-blue-600">Solte o arquivo aqui...</p>
        ) : (
          <div>
            <p className="text-gray-600 mb-1">
              Arraste um arquivo aqui ou clique para selecionar
            </p>
            <p className="text-sm text-gray-500">
              Suportado: PNG, JPG, PDF (máx. 50MB)
            </p>
          </div>
        )}
      </div>

      {/* Modal de Confirmação */}
      <AnexoConfirmModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        file={selectedFile}
        pacienteId={pacienteId}
        onConfirm={handleConfirm}
      />
    </>
  );
}
