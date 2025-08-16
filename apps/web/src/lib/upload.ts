import api from './api'

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  success: boolean;
  key?: string;
  error?: string;
}

/**
 * Função para fazer upload de arquivo usando presigned URLs
 */
export async function uploadAnexo(file: File): Promise<UploadResult> {
  try {
    // Determinar contentType baseado na extensão se file.type estiver vazio
    let contentType = file.type;
    if (!contentType || contentType === '') {
      const extension = file.name.split('.').pop()?.toLowerCase();
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
      contentType = mimeTypes[extension || ''] || 'application/octet-stream';
    }

    // Obter URL assinada para upload
    const response = await api.post('/anexos/presign', {
      filename: file.name,
      contentType: contentType,
      size: file.size,
    });

    if (!response.data.url || !response.data.key) {
      throw new Error('Resposta inválida do servidor');
    }

    // Fazer upload direto para o S3/MinIO usando fetch
    const uploadResponse = await fetch(response.data.url, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
      },
      body: file,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Upload falhou: ${uploadResponse.status} - ${errorText}`);
    }

    return {
      success: true,
      key: response.data.key,
    };
  } catch (error) {
    console.error('Erro no upload:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

/**
 * Função para obter URL de download de um arquivo
 */
export async function getDownloadUrl(key: string): Promise<string> {
  try {
    const response = await api.get(`/anexos/presign?key=${encodeURIComponent(key)}`);
    return response.data.url;
  } catch (error) {
    console.error('Erro ao obter URL de download:', error);
    throw new Error('Não foi possível obter a URL de download');
  }
}

/**
 * Função para deletar um arquivo
 */
export async function deleteAnexo(key: string): Promise<boolean> {
  try {
    await api.delete(`/anexos/${encodeURIComponent(key)}`);
    return true;
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
    return false;
  }
}

/**
 * Função para fazer download de um arquivo
 */
export async function downloadAnexo(key: string, filename?: string): Promise<void> {
  try {
    const url = await getDownloadUrl(key);
    
    // Criar link temporário para download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'download';
    link.target = '_blank';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Erro no download:', error);
    throw new Error('Não foi possível fazer o download do arquivo');
  }
}
