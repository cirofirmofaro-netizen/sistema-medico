import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MedicacoesService {
  constructor(private prisma: PrismaService) {}

  porPaciente(pacienteId: string) {
    return this.prisma.medicacaoAtiva.findMany({ where: { pacienteId }, orderBy: { createdAt: 'desc' }});
  }
  create(dto: any) { return this.prisma.medicacaoAtiva.create({ data: {
    pacienteId: dto.pacienteId, nome: dto.nome, dose: dto.dose ?? null,
    via: dto.via ?? null, frequencia: dto.frequencia ?? null,
    inicioEm: dto.inicioEm ? new Date(dto.inicioEm) : null,
    terminoEm: dto.terminoEm ? new Date(dto.terminoEm) : null
  } as any}); }
  async update(id: string, dto: any) {
    await this.ensure(id);
    return this.prisma.medicacaoAtiva.update({ where: { id }, data: {
      ...(dto.nome && { nome: dto.nome }),
      ...(dto.dose !== undefined && { dose: dto.dose }),
      ...(dto.via !== undefined && { via: dto.via }),
      ...(dto.frequencia !== undefined && { frequencia: dto.frequencia }),
      ...(dto.inicioEm && { inicioEm: new Date(dto.inicioEm) }),
      ...(dto.terminoEm && { terminoEm: new Date(dto.terminoEm) }),
    }});
  }
  async remove(id: string) { await this.ensure(id); return this.prisma.medicacaoAtiva.delete({ where: { id } }); }
  private async ensure(id: string){ const x = await this.prisma.medicacaoAtiva.findUnique({ where: { id } }); if (!x) throw new NotFoundException('Medicação não encontrada'); }
}
