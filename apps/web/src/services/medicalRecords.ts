import api from '../lib/api'
import { Evolution, CreateEvolutionData, UpdateEvolutionData, VitalSigns, CreateVitalSignsData, UpdateVitalSignsData, FileMeta, UploadFileData } from '../types'
import { uploadAnexo, getDownloadUrl, deleteAnexo } from '../lib/upload'

// Evoluções
export const evolutionsService = {
  async listEvolutions(patientId: string): Promise<Evolution[]> {
    // Primeiro, buscar o atendimento do dia ou criar um novo
    const atendimentos = await api.get(`/atendimentos/patients/${patientId}`)
    let atendimentoId = null
    
    if (atendimentos.data.length > 0) {
      // Usar o atendimento mais recente
      atendimentoId = atendimentos.data[0].id
    } else {
      // Criar um novo atendimento do dia
      const newAtendimento = await api.post(`/atendimentos/patients/${patientId}/evolucoes`, {
        texto: 'Atendimento iniciado',
        when: new Date().toISOString()
      })
      atendimentoId = newAtendimento.data.atendimentoId
    }
    
    // Buscar evoluções do atendimento
    const response = await api.get(`/atendimentos/patients/${patientId}/evolucoes`)
    return response.data
  },

  async getEvolution(patientId: string, evolutionId: string): Promise<Evolution> {
    const response = await api.get(`/atendimentos/evolucoes/${evolutionId}`)
    return response.data
  },

  async createEvolution(data: CreateEvolutionData): Promise<Evolution> {
    const response = await api.post(`/atendimentos/patients/${data.patientId}/evolucoes`, {
      texto: data.texto,
      resumo: data.resumo,
      when: data.when || new Date().toISOString()
    })
    return response.data
  },

  async updateEvolution(patientId: string, data: UpdateEvolutionData): Promise<Evolution> {
    const { id, ...updateData } = data
    const response = await api.put(`/atendimentos/evolucoes/${id}`, updateData)
    return response.data
  },

  async deleteEvolution(patientId: string, evolutionId: string): Promise<void> {
    await api.delete(`/atendimentos/evolucoes/${evolutionId}`)
  }
}

// Sinais Vitais
export const vitalsService = {
  async listVitals(patientId: string): Promise<VitalSigns[]> {
    const response = await api.get(`/atendimentos/patients/${patientId}/sinais-vitais`)
    return response.data
  },

  async getVital(patientId: string, vitalId: string): Promise<VitalSigns> {
    const response = await api.get(`/atendimentos/sinais-vitais/${vitalId}`)
    return response.data
  },

  async createVital(data: CreateVitalSignsData): Promise<VitalSigns> {
    const response = await api.post(`/atendimentos/patients/${data.patientId}/sinais-vitais`, {
      pressaoSistolica: data.pressaoSistolica,
      pressaoDiastolica: data.pressaoDiastolica,
      frequenciaCardiaca: data.frequenciaCardiaca,
      frequenciaRespiratoria: data.frequenciaRespiratoria,
      saturacaoOxigenio: data.saturacaoOxigenio,
      temperatura: data.temperatura,
      peso: data.peso,
      altura: data.altura,
      observacoes: data.observacoes,
      when: data.when || new Date().toISOString()
    })
    return response.data
  },

  async updateVital(patientId: string, data: UpdateVitalSignsData): Promise<VitalSigns> {
    const { id, ...updateData } = data
    const response = await api.put(`/atendimentos/sinais-vitais/${id}`, updateData)
    return response.data
  },

  async deleteVital(patientId: string, vitalId: string): Promise<void> {
    await api.delete(`/atendimentos/sinais-vitais/${vitalId}`)
  }
}

// Anexos - Usando novo sistema de upload
export const filesService = {
  async listFiles(patientId: string): Promise<FileMeta[]> {
    const response = await api.get(`/atendimentos/patients/${patientId}/anexos`)
    return response.data
  },

  async uploadFile(data: UploadFileData): Promise<FileMeta> {
    // Primeiro, buscar ou criar atendimento do dia
    const atendimentos = await api.get(`/atendimentos/patients/${data.patientId}`)
    let atendimentoId = null
    
    if (atendimentos.data.length > 0) {
      atendimentoId = atendimentos.data[0].id
    } else {
      // Criar um novo atendimento do dia
      const newAtendimento = await api.post(`/atendimentos/patients/${data.patientId}/evolucoes`, {
        texto: 'Atendimento iniciado',
        when: new Date().toISOString()
      })
      atendimentoId = newAtendimento.data.atendimentoId
    }
    
    // Usar o novo sistema de upload
    const uploadResult = await uploadAnexo(data.file)
    
    if (!uploadResult.success || !uploadResult.key) {
      throw new Error(uploadResult.error || 'Erro no upload do arquivo')
    }
    
    // Determinar contentType baseado na extensão se file.type estiver vazio
    let contentType = data.file.type;
    if (!contentType || contentType === '') {
      const extension = data.file.name.split('.').pop()?.toLowerCase();
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
    
    // Finalizar o upload no banco de dados
    const finalizeResponse = await api.post(`/anexos/finalize/${atendimentoId}`, {
      filename: data.file.name,
      mimeType: contentType,
      size: data.file.size,
      storageKey: uploadResult.key,
      titulo: data.titulo,
      tipoDocumento: data.tipoDocumento
    })
    
    return finalizeResponse.data
  },

  async deleteFile(patientId: string, fileId: string): Promise<void> {
    // Deletar do banco (que também deleta do storage)
    await api.delete(`/anexos/anexo/${fileId}`)
  },

  async getFile(patientId: string, fileId: string): Promise<FileMeta> {
    const response = await api.get(`/anexos/${fileId}`)
    return response.data
  },

  async downloadFile(patientId: string, fileId: string): Promise<string> {
    // Primeiro obter o arquivo para pegar a storage key
    const file = await this.getFile(patientId, fileId)
    
    if (!file.storageKey) {
      throw new Error('Storage key não encontrada')
    }
    
    // Usar o novo sistema de download
    return await getDownloadUrl(file.storageKey)
  }
}
