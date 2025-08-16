import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePagamentoDto } from './dto/create-pagamento.dto';
import { StatusPagamento } from '@prisma/client';

@Injectable()
export class PagamentosService {
  constructor(private prisma: PrismaService) {}

  async create(createPagamentoDto: CreatePagamentoDto) {
    // Verificar se a fonte pagadora existe
    const fontePagadora = await this.prisma.fontePagadora.findUnique({
      where: { id: createPagamentoDto.fontePagadoraId },
    });

    if (!fontePagadora) {
      throw new NotFoundException('Fonte pagadora não encontrada');
    }

    // Se tiver plantaoId, verificar se o plantão existe
    if (createPagamentoDto.plantaoId) {
      const plantao = await this.prisma.plantao.findUnique({
        where: { id: createPagamentoDto.plantaoId },
      });

      if (!plantao) {
        throw new NotFoundException('Plantão não encontrado');
      }
    }

    // Criar o pagamento
    const pagamento = await this.prisma.pagamento.create({
      data: {
        ...createPagamentoDto,
        dataPagamento: createPagamentoDto.dataPagamento ? new Date(createPagamentoDto.dataPagamento) : new Date(),
        valorPrevisto: createPagamentoDto.valorPrevisto,
        valorPago: createPagamentoDto.valorPago,
      } as any,
      include: {
        plantao: true,
        fontePagadora: true,
        notaFiscal: true,
      },
    });

    // Se tiver plantaoId, recalcular status do plantão
    if (createPagamentoDto.plantaoId) {
      await this.recalcularStatusPlantao(createPagamentoDto.plantaoId);
    }

    return pagamento;
  }

  async findAll(filters?: {
    competencia?: string;
    fontePagadoraId?: string;
    status?: StatusPagamento;
  }) {
    const where: any = {};

    if (filters?.competencia) {
      where.competencia = filters.competencia;
    }

    if (filters?.fontePagadoraId) {
      where.fontePagadoraId = filters.fontePagadoraId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    return this.prisma.pagamento.findMany({
      where,
      include: {
        plantao: true,
        fontePagadora: true,
        notaFiscal: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const pagamento = await this.prisma.pagamento.findUnique({
      where: { id },
      include: {
        plantao: true,
        fontePagadora: true,
        notaFiscal: true,
      },
    });

    if (!pagamento) {
      throw new NotFoundException('Pagamento não encontrado');
    }

    return pagamento;
  }

  async findByPlantao(plantaoId: string) {
    return this.prisma.pagamento.findMany({
      where: { plantaoId },
      include: {
        fontePagadora: true,
        notaFiscal: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async recalcularStatusPlantao(plantaoId: string) {
    // Buscar todos os pagamentos do plantão
    const pagamentos = await this.prisma.pagamento.findMany({
      where: { plantaoId },
    });

    // Buscar o plantão
    const plantao = await this.prisma.plantao.findUnique({
      where: { id: plantaoId },
    });

    if (!plantao) {
      throw new NotFoundException('Plantão não encontrado');
    }

    // Calcular total pago
    const totalPago = pagamentos.reduce((sum, pag) => sum + Number(pag.valorPago), 0);
    const valorPrevisto = Number(plantao.valorPrevisto);

    // Determinar status do pagamento
    let statusPagamento: StatusPagamento;

    if (totalPago === 0) {
      statusPagamento = StatusPagamento.PENDENTE;
    } else if (totalPago < valorPrevisto) {
      statusPagamento = StatusPagamento.PARCIAL;
    } else {
      statusPagamento = StatusPagamento.PAGO;
    }

    // Verificar se está em atraso (mais de 30 dias após a data do plantão)
    const hoje = new Date();
    const dataPlantao = new Date(plantao.data);
    const diasAtraso = Math.floor((hoje.getTime() - dataPlantao.getTime()) / (1000 * 60 * 60 * 24));

    if (statusPagamento !== StatusPagamento.PAGO && diasAtraso > 30) {
      statusPagamento = StatusPagamento.EM_ATRASO;
    }

    // Atualizar status de todos os pagamentos do plantão
    await this.prisma.pagamento.updateMany({
      where: { plantaoId },
      data: { status: statusPagamento },
    });

    return statusPagamento;
  }

  async registrarPagamento(data: {
    plantaoId?: string;
    fontePagadoraId: string;
    competencia: string;
    valorPago: number;
    dataPagamento?: Date;
    meio: any;
    valorPrevisto?: number;
  }) {
    // Se não tiver valorPrevisto, usar o valor do plantão ou 0
    let valorPrevisto = data.valorPrevisto || 0;

    if (data.plantaoId && !data.valorPrevisto) {
      const plantao = await this.prisma.plantao.findUnique({
        where: { id: data.plantaoId },
      });
      if (plantao) {
        valorPrevisto = Number(plantao.valorPrevisto);
      }
    }

    const pagamento = await this.create({
      plantaoId: data.plantaoId,
      fontePagadoraId: data.fontePagadoraId,
      competencia: data.competencia,
      valorPrevisto,
      valorPago: data.valorPago,
      dataPagamento: data.dataPagamento?.toISOString(),
      meio: data.meio,
    });

    return pagamento;
  }

  async getResumoFinanceiro(ano?: number, mes?: number) {
    const where: any = {};

    if (ano && mes) {
      where.competencia = `${ano.toString().padStart(4, '0')}-${mes.toString().padStart(2, '0')}`;
    } else if (ano) {
      where.competencia = {
        startsWith: ano.toString(),
      };
    }

    const pagamentos = await this.prisma.pagamento.findMany({
      where,
      include: {
        fontePagadora: true,
        plantao: true,
      },
    });

    const resumo = {
      totalPrevisto: 0,
      totalPago: 0,
      totalPendente: 0,
      totalParcial: 0,
      totalEmAtraso: 0,
      porFontePagadora: {},
    };

    pagamentos.forEach((pag) => {
      const valorPrevisto = Number(pag.valorPrevisto);
      const valorPago = Number(pag.valorPago);

      resumo.totalPrevisto += valorPrevisto;
      resumo.totalPago += valorPago;

      switch (pag.status) {
        case StatusPagamento.PENDENTE:
          resumo.totalPendente += valorPrevisto;
          break;
        case StatusPagamento.PARCIAL:
          resumo.totalParcial += valorPrevisto - valorPago;
          break;
        case StatusPagamento.PAGO:
          resumo.totalPago += valorPago;
          break;
        case StatusPagamento.EM_ATRASO:
          resumo.totalEmAtraso += valorPrevisto - valorPago;
          break;
      }

      // Agrupar por fonte pagadora
      const fonteNome = pag.fontePagadora.nome;
      if (!resumo.porFontePagadora[fonteNome]) {
        resumo.porFontePagadora[fonteNome] = {
          totalPrevisto: 0,
          totalPago: 0,
          pagamentos: [],
        };
      }

      resumo.porFontePagadora[fonteNome].totalPrevisto += valorPrevisto;
      resumo.porFontePagadora[fonteNome].totalPago += valorPago;
      resumo.porFontePagadora[fonteNome].pagamentos.push(pag);
    });

    return resumo;
  }
}
