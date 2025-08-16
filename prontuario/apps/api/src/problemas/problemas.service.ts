import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProblemasService {
  constructor(private prisma: PrismaService) {}

  porPaciente(pacienteId: string) {
    return this.prisma.problemaClinico.findMany({ where: { pacienteId }, orderBy: { createdAt: 'desc' }});
  }
  create(dto: any) { return this.prisma.problemaClinico.create({ data: {
    pacienteId: dto.pacienteId, titulo: dto.titulo, cid: dto.cid ?? null,
    status: dto.status ?? 'ATIVO', inicioEm: dto.inicioEm ? new Date(dto.inicioEm) : null,
    terminoEm: dto.terminoEm ? new Date(dto.terminoEm) : null, notas: dto.notas ?? null
  } as any}); }
  async update(id: string, dto: any) {
    await this.ensure(id);
    return this.prisma.problemaClinico.update({ where: { id }, data: {
      ...(dto.titulo && { titulo: dto.titulo }),
      ...(dto.cid !== undefined && { cid: dto.cid }),
      ...(dto.status !== undefined && { status: dto.status }),
      ...(dto.inicioEm && { inicioEm: new Date(dto.inicioEm) }),
      ...(dto.terminoEm && { terminoEm: new Date(dto.terminoEm) }),
      ...(dto.notas !== undefined && { notas: dto.notas }),
    }});
  }
  async remove(id: string) { await this.ensure(id); return this.prisma.problemaClinico.delete({ where: { id } }); }
  private async ensure(id: string){ const x = await this.prisma.problemaClinico.findUnique({ where: { id } }); if (!x) throw new NotFoundException('Problema não encontrado'); }
}
