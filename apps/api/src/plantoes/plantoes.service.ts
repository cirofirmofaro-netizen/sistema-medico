import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlantaoDto } from './dto/create-plantao.dto';
import { ListPlantoesDto } from './dto/list-plantoes.dto';
import { UpdatePlantaoDto } from './dto/update-plantao.dto';
import { RegistrarPagamentoDto } from './dto/registrar-pagamento.dto';

@Injectable()
export class PlantoesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePlantaoDto) {
    return this.prisma.plantao.create({
      data: {
        inicio: new Date(dto.inicio),
        fim: new Date(dto.fim),
        local: dto.local,
        contratante: dto.contratante,
        tipo: dto.tipo,
        valorBruto: dto.valorBruto,
        valorLiquido: dto.valorLiquido ?? null,
        statusPgto: dto.statusPgto ?? 'PENDENTE',
        notas: dto.notas ?? null,
      },
    });
  }

  async list(q: ListPlantoesDto) {
    const where: any = {};
    if (q.from || q.to) {
      where.inicio = {};
      if (q.from) where.inicio.gte = new Date(q.from);
      if (q.to) where.inicio.lte = new Date(q.to);
    }
    if (q.contratante) where.contratante = { contains: q.contratante, mode: 'insensitive' };
    if (q.tipo) where.tipo = { contains: q.tipo, mode: 'insensitive' };
    if (q.statusPgto) where.statusPgto = q.statusPgto;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.plantao.findMany({
        where,
        orderBy: { inicio: 'desc' },
        skip: q.skip ?? 0,
        take: q.take ?? 50,
      }),
      this.prisma.plantao.count({ where }),
    ]);

    return { items, total };
  }

  async byId(id: string) {
    const found = await this.prisma.plantao.findUnique({
      where: { id },
      include: { pagamentos: true },
    });
    if (!found) throw new NotFoundException('Plantão não encontrado');
    return found;
  }

  async update(id: string, dto: UpdatePlantaoDto) {
    await this.ensureExists(id);
    return this.prisma.plantao.update({
      where: { id },
      data: {
        ...(dto.inicio && { inicio: new Date(dto.inicio) }),
        ...(dto.fim && { fim: new Date(dto.fim) }),
        ...(dto.local && { local: dto.local }),
        ...(dto.contratante && { contratante: dto.contratante }),
        ...(dto.tipo && { tipo: dto.tipo }),
        ...(dto.valorBruto !== undefined && { valorBruto: dto.valorBruto }),
        ...(dto.valorLiquido !== undefined && { valorLiquido: dto.valorLiquido }),
        ...(dto.statusPgto && { statusPgto: dto.statusPgto }),
        ...(dto.notas !== undefined && { notas: dto.notas }),
      },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.pagamentoPlantao.deleteMany({ where: { plantaoId: id } });
    return this.prisma.plantao.delete({ where: { id } });
  }

  async pagar(plantaoId: string, dto: RegistrarPagamentoDto) {
    await this.ensureExists(plantaoId);
    const pagamento = await this.prisma.pagamentoPlantao.create({
      data: {
        plantaoId,
        dtPrevista: dto.dtPrevista ? new Date(dto.dtPrevista) : null,
        dtPgto: dto.dtPgto ? new Date(dto.dtPgto) : null,
        valorPago: dto.valorPago,
        comprovanteKey: dto.comprovanteKey ?? null,
        obs: dto.obs ?? null,
      },
    });
    await this.prisma.plantao.update({
      where: { id: plantaoId },
      data: { statusPgto: dto.dtPgto ? 'PAGO' : 'PARCIAL' },
    });
    return pagamento;
  }

  private async ensureExists(id: string) {
    const exists = await this.prisma.plantao.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Plantão não encontrado');
  }
}
