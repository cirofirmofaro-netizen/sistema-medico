import { Injectable } from '@nestjs/common';

@Injectable()
export class ConsultasService {
  async list(params: { from?: string; to?: string; page?: number; limit?: number }) {
    // Mock data por enquanto
    return {
      appointments: [],
      total: 0,
      page: params.page || 1,
      totalPages: 0,
    };
  }

  async create(data: any) {
    // Mock data por enquanto
    return {
      id: '1',
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async byId(id: string) {
    // Mock data por enquanto
    return {
      id,
      patientId: '1',
      startsAt: new Date().toISOString(),
      endsAt: new Date(Date.now() + 3600000).toISOString(),
      type: 'PRESENCIAL',
      status: 'AGENDADA',
      notes: 'Consulta de teste',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async update(id: string, data: any) {
    // Mock data por enquanto
    return {
      id,
      ...data,
      updatedAt: new Date().toISOString(),
    };
  }

  async remove(id: string) {
    // Mock - retorna sucesso
    return { success: true };
  }
}
