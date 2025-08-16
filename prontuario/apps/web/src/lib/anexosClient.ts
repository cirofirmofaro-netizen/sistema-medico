import api from './api';

// Cliente direto para a API (sem proxy)
const apiDirect = {
  post: (url: string, data: any) => fetch(`http://localhost:3000${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(data),
  }).then(res => {
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return res.json();
  }),
  
  get: (url: string, config?: any) => {
    const params = config?.params ? `?${new URLSearchParams(config.params)}` : '';
    return fetch(`http://localhost:3000${url}${params}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    }).then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      return res.json();
    });
  },
  
  delete: (url: string) => fetch(`http://localhost:3000${url}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  }).then(res => {
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }),
};

export interface TempUploadResult {
  url: string;
  key: string;
  expires: number;
}

export interface TempPreviewResult {
  url: string;
  expires: number;
}

export interface CommitResult {
  keyFinal: string;
  urlGet: string;
  anexoId: string;
  success: boolean;
}

export interface CommitRequest {
  keyTemp: string;
  pacienteId: string;
  tipo?: string;
  observacao?: string;
  contentType: string;
  filename: string;
  size: number;
}

/**
 * Cliente para operações de anexos com revisão
 */
export const anexosClient = {
  /**
   * Gera URL assinada para upload temporário
   */
  async presignTemp(file: File): Promise<TempUploadResult> {
    const response = await apiDirect.post('/anexos/presign-temp', {
      filename: file.name,
      contentType: file.type || this.getContentTypeFromExtension(file.name),
      size: file.size,
    });
    return response;
  },

  /**
   * Gera URL assinada para visualização de arquivo temporário
   */
  async getTempPreviewUrl(key: string, inline: boolean = true): Promise<TempPreviewResult> {
    const response = await apiDirect.get('/anexos/temp/presign', {
      params: { key, inline: inline.toString() },
    });
    return response;
  },

  /**
   * Deleta arquivo temporário
   */
  async deleteTemp(key: string): Promise<void> {
    await apiDirect.delete(`/anexos/temp/${key}`);
  },

  /**
   * Confirma upload temporário e move para definitivo
   */
  async commitTemp(data: CommitRequest): Promise<CommitResult> {
    const response = await apiDirect.post('/anexos/commit', data);
    return response;
  },

  /**
   * Faz upload direto para URL assinada
   */
  async uploadToSignedUrl(putUrl: string, file: File, onProgress?: (progress: number) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      // Usar proxy para contornar CORS
      const formData = new FormData();
      formData.append('file', file);
      formData.append('url', putUrl);
      
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open('POST', '/api/anexos/upload-proxy');
      xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
      xhr.send(formData);
    });
  },

  /**
   * Determina Content-Type baseado na extensão do arquivo
   */
  getContentTypeFromExtension(filename: string): string {
    const extension = filename.toLowerCase().split('.').pop();
    
    const mimeTypes: Record<string, string> = {
      'pdf': 'application/pdf',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'txt': 'text/plain',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };

    return mimeTypes[extension || ''] || 'application/octet-stream';
  },

  /**
   * Valida arquivo antes do upload
   */
  validateFile(file: File): { isValid: boolean; error?: string } {
    const allowedTypes = ['image/png', 'image/jpeg', 'application/pdf'];
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `Tipo de arquivo não permitido: ${file.type}. Permitidos: ${allowedTypes.join(', ')}`,
      };
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `Arquivo muito grande: ${(file.size / 1024 / 1024).toFixed(2)}MB. Máximo: 50MB`,
      };
    }

    return { isValid: true };
  },

  /**
   * Formata tamanho do arquivo
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },
};
