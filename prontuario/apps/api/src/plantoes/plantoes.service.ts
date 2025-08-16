import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlantaoDto } from './dto/create-plantao.dto';
import { StatusPlantao } from '@prisma/client';

@Injectable()
export class PlantoesService {
  constructor(private prisma: PrismaService) {}

  async create(createPlantaoDto: CreatePlantaoDto) {
    // Verificar se a fonte pagadora existe
    const fontePagadora = await this.prisma.fontePagadora.findUnique({
      where: { id: createPlantaoDto.fontePagadoraId },
    });

    if (!fontePagadora) {
      throw new NotFoundException('Fonte pagadora não encontrada');
    }

    // Se tiver modeloId, verificar se o modelo existe
    if (createPlantaoDto.modeloId) {
      const modelo = await this.prisma.modeloPlantao.findUnique({
        where: { id: createPlantaoDto.modeloId },
      });

      if (!modelo) {
        throw new NotFoundException('Modelo de plantão não encontrado');
      }
    }

    // Verificar se não há conflito de horário
    const conflito = await this.verificarConflitoHorario(
      createPlantaoDto.inicio,
      createPlantaoDto.fim,
      createPlantaoDto.data,
    );

    if (conflito) {
      throw new BadRequestException('Existe conflito de horário com outro plantão');
    }

    return this.prisma.plantao.create({
      data: {
        ...createPlantaoDto,
        data: new Date(createPlantaoDto.data),
        inicio: new Date(createPlantaoDto.inicio),
        fim: new Date(createPlantaoDto.fim),
        valorPrevisto: createPlantaoDto.valorPrevisto,
      } as any,
      include: {
        modelo: true,
        fontePagadora: true,
        pagamentos: true,
      },
    });
  }

  async findAll(filters?: {
    from?: string;
    to?: string;
    status?: StatusPlantao;
    fontePagadoraId?: string;
  }) {
    const where: any = {};

    if (filters?.from || filters?.to) {
      where.data = {};
      if (filters.from) {
        where.data.gte = new Date(filters.from);
      }
      if (filters.to) {
        where.data.lte = new Date(filters.to);
      }
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.fontePagadoraId) {
      where.fontePagadoraId = filters.fontePagadoraId;
    }

    return this.prisma.plantao.findMany({
      where,
      include: {
        modelo: true,
        fontePagadora: true,
        pagamentos: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { data: 'desc' },
    });
  }

  async findOne(id: string) {
    const plantao = await this.prisma.plantao.findUnique({
      where: { id },
      include: {
        modelo: true,
        fontePagadora: true,
        pagamentos: {
          include: {
            notaFiscal: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        notasFiscais: true,
      },
    });

    if (!plantao) {
      throw new NotFoundException('Plantão não encontrado');
    }

    return plantao;
  }

  async marcarRealizado(id: string) {
    const plantao = await this.findOne(id);

    if (plantao.status !== StatusPlantao.AGENDADO) {
      throw new BadRequestException('Apenas plantões agendados podem ser marcados como realizados');
    }

    return this.prisma.plantao.update({
      where: { id },
      data: { status: StatusPlantao.REALIZADO },
      include: {
        modelo: true,
        fontePagadora: true,
        pagamentos: true,
      },
    });
  }

  async registrarTroca(id: string, data: {
    trocaCom: string;
    motivo: string;
    reagendadoPara?: string;
  }) {
    const plantao = await this.findOne(id);

    if (plantao.status !== StatusPlantao.AGENDADO) {
      throw new BadRequestException('Apenas plantões agendados podem ser trocados');
    }

    return this.prisma.plantao.update({
      where: { id },
      data: {
        status: StatusPlantao.TROCADO,
        ehTroca: true,
        trocaCom: data.trocaCom,
        motivoTroca: data.motivo,
        reagendadoPara: data.reagendadoPara ? new Date(data.reagendadoPara) : null,
      },
      include: {
        modelo: true,
        fontePagadora: true,
        pagamentos: true,
      },
    });
  }

  async cancelar(id: string) {
    const plantao = await this.findOne(id);

    if (plantao.status !== StatusPlantao.AGENDADO) {
      throw new BadRequestException('Apenas plantões agendados podem ser cancelados');
    }

    return this.prisma.plantao.update({
      where: { id },
      data: { status: StatusPlantao.CANCELADO },
      include: {
        modelo: true,
        fontePagadora: true,
        pagamentos: true,
      },
    });
  }

  async criarPlantaoAvulso(data: {
    fontePagadoraId: string;
    data: string;
    inicio: string;
    fim: string;
    local: string;
    cnpj: string;
    valorPrevisto: number;
    tipoVinculo: any;
  }) {
    return this.create({
      fontePagadoraId: data.fontePagadoraId,
      data: data.data,
      inicio: data.inicio,
      fim: data.fim,
      local: data.local,
      cnpj: data.cnpj,
      valorPrevisto: data.valorPrevisto,
      tipoVinculo: data.tipoVinculo,
    });
  }

  async gerarOcorrenciasPorModelo(modeloId: string, range: { start: string; end: string }) {
    const modelo = await this.prisma.modeloPlantao.findUnique({
      where: { id: modeloId },
      include: { fontePagadora: true },
    });

    if (!modelo) {
      throw new NotFoundException('Modelo de plantão não encontrado');
    }

    if (!modelo.recorrencia) {
      throw new BadRequestException('Modelo não possui recorrência configurada');
    }

    const startDate = new Date(range.start);
    const endDate = new Date(range.end);
    const ocorrencias: any[] = [];

    // Gerar ocorrências baseadas na recorrência
    const recorrencia = modelo.recorrencia as any;
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      // Verificar se o dia da semana está na recorrência
      const dayOfWeek = currentDate.getDay();
      
      if (!recorrencia.byWeekday || recorrencia.byWeekday.includes(dayOfWeek)) {
        // Calcular horários baseados no modelo
        const [inicioHora, inicioMin] = modelo.inicioPadrao.split(':').map(Number);
        const [fimHora, fimMin] = modelo.fimPadrao.split(':').map(Number);

        const inicio = new Date(currentDate);
        inicio.setHours(inicioHora, inicioMin, 0, 0);

        const fim = new Date(currentDate);
        fim.setHours(fimHora, fimMin, 0, 0);

        // Verificar se não há conflito
        const conflito = await this.verificarConflitoHorario(
          inicio.toISOString(),
          fim.toISOString(),
          currentDate.toISOString(),
        );

        if (!conflito) {
          const plantao = await this.create({
            modeloId: modeloId,
            fontePagadoraId: modelo.fontePagadoraId,
            data: currentDate.toISOString(),
            inicio: inicio.toISOString(),
            fim: fim.toISOString(),
            local: modelo.local,
            cnpj: modelo.fontePagadora.cnpj,
            valorPrevisto: Number(modelo.valorPrevisto),
            tipoVinculo: modelo.tipoVinculo,
          });

          ocorrencias.push(plantao as any);
        }
      }

      // Avançar para o próximo dia baseado na frequência
      const interval = recorrencia.interval || 1;
      switch (recorrencia.freq) {
        case 'WEEKLY':
          currentDate.setDate(currentDate.getDate() + (7 * interval));
          break;
        case 'BIWEEKLY':
          currentDate.setDate(currentDate.getDate() + (14 * interval));
          break;
        case 'MONTHLY':
          currentDate.setMonth(currentDate.getMonth() + interval);
          break;
        default:
          currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    return ocorrencias;
  }

  private async verificarConflitoHorario(inicio: string, fim: string, data: string) {
    const inicioDate = new Date(inicio);
    const fimDate = new Date(fim);
    const dataDate = new Date(data);

    // Buscar plantões no mesmo dia
    const plantoesMesmoDia = await this.prisma.plantao.findMany({
      where: {
        data: {
          gte: new Date(dataDate.getFullYear(), dataDate.getMonth(), dataDate.getDate()),
          lt: new Date(dataDate.getFullYear(), dataDate.getMonth(), dataDate.getDate() + 1),
        },
        status: {
          in: [StatusPlantao.AGENDADO, StatusPlantao.REALIZADO],
        },
      },
    });

    // Verificar sobreposição de horários
    for (const plantao of plantoesMesmoDia) {
      const plantaoInicio = new Date(plantao.inicio);
      const plantaoFim = new Date(plantao.fim);

      if (
        (inicioDate < plantaoFim && fimDate > plantaoInicio) ||
        (plantaoInicio < fimDate && plantaoFim > inicioDate)
      ) {
        return true; // Há conflito
      }
    }

    return false; // Não há conflito
  }

  async getResumoPlantoes(ano?: number, mes?: number) {
    const where: any = {};

    if (ano && mes) {
      where.data = {
        gte: new Date(ano, mes - 1, 1),
        lt: new Date(ano, mes, 1),
      };
    } else if (ano) {
      where.data = {
        gte: new Date(ano, 0, 1),
        lt: new Date(ano + 1, 0, 1),
      };
    }

    const plantoes = await this.prisma.plantao.findMany({
      where,
      include: {
        fontePagadora: true,
        pagamentos: true,
      },
    });

    const resumo = {
      total: plantoes.length,
      agendados: 0,
      realizados: 0,
      cancelados: 0,
      trocados: 0,
      valorTotalPrevisto: 0,
      valorTotalRealizado: 0,
      porFontePagadora: {},
    };

    plantoes.forEach((plantao) => {
      const valorPrevisto = Number(plantao.valorPrevisto);
      resumo.valorTotalPrevisto += valorPrevisto;

      switch (plantao.status) {
        case StatusPlantao.AGENDADO:
          resumo.agendados++;
          break;
        case StatusPlantao.REALIZADO:
          resumo.realizados++;
          resumo.valorTotalRealizado += valorPrevisto;
          break;
        case StatusPlantao.CANCELADO:
          resumo.cancelados++;
          break;
        case StatusPlantao.TROCADO:
          resumo.trocados++;
          break;
      }

      // Agrupar por fonte pagadora
      const fonteNome = plantao.fontePagadora.nome;
      if (!resumo.porFontePagadora[fonteNome]) {
        resumo.porFontePagadora[fonteNome] = {
          total: 0,
          realizados: 0,
          valorPrevisto: 0,
          valorRealizado: 0,
        };
      }

      resumo.porFontePagadora[fonteNome].total++;
      resumo.porFontePagadora[fonteNome].valorPrevisto += valorPrevisto;

      if (plantao.status === StatusPlantao.REALIZADO) {
        resumo.porFontePagadora[fonteNome].realizados++;
        resumo.porFontePagadora[fonteNome].valorRealizado += valorPrevisto;
      }
    });

    return resumo;
  }
}
