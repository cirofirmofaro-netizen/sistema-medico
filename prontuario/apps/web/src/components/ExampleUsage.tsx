import React from 'react';
import { SimpleAnexoUploader } from './SimpleAnexoUploader';

export function ExampleUsage() {
  const pacienteId = "exemplo-paciente-id"; // Substitua pelo ID real do paciente

  const handleUploadComplete = () => {
    console.log('Upload completado!');
    // Aqui você pode atualizar a lista de anexos, mostrar notificação, etc.
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Upload de Anexos com Revisão</h1>
      
      <SimpleAnexoUploader 
        pacienteId={pacienteId}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  );
}
