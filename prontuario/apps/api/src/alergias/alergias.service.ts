import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AlergiasService {
  constructor(private prisma: PrismaService) {}

  porPaciente(pacienteId: string) {
    return this.prisma.alergia.findMany({ where: { pacienteId }, orderBy: { createdAt: 'desc' }});
  }
  create(dto: any) { 
    return this.prisma.alergia.create({ 
      data: {
        pacienteId: dto.pacienteId,
        descricao: dto.descricao,
        reacao: dto.reacao,
        severidade: dto.severidade,
        observadoEm: dto.observadoEm ? new Date(dto.observadoEm) : null,
      } as any
    }); 
  }
  async update(id: string, dto: any) {
    await this.ensure(id);
    return this.prisma.alergia.update({ where: { id }, data: {
      ...(dto.descricao && { descricao: dto.descricao }),
      ...(dto.reacao !== undefined && { reacao: dto.reacao }),
      ...(dto.severidade !== undefined && { severidade: dto.severidade }),
      ...(dto.observadoEm && { observadoEm: new Date(dto.observadoEm) }),
    }});
  }
  async remove(id: string) { await this.ensure(id); return this.prisma.alergia.delete({ where: { id } }); }
  private async ensure(id: string){ const x = await this.prisma.alergia.findUnique({ where: { id } }); if (!x) throw new NotFoundException('Alergia não encontrada'); }
}
