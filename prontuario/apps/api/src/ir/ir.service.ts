import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { StatusInforme } from '@prisma/client';
import archiver from 'archiver';
import { Readable } from 'stream';

@Injectable()
export class IRService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

  async gerarChecklist(anoRef: number) {
    // Buscar fontes pagadoras ativas no ano
    const fontesAtivas = await this.prisma.fontePagadora.findMany({
      where: {
        ativo: true,
        OR: [
          {
            inicio: {
              lte: new Date(anoRef, 11, 31), // Até 31/12 do ano
            },
          },
          {
            fim: {
              gte: new Date(anoRef, 0, 1), // A partir de 01/01 do ano
            },
          },
        ],
      },
    });

    // Buscar fontes que tiveram pagamentos no ano
    const pagamentosAno = await this.prisma.pagamento.findMany({
      where: {
        competencia: {
          startsWith: anoRef.toString(),
        },
      },
      include: {
        fontePagadora: true,
      },
    });

    // Criar mapa de fontes únicas
    const fontesMap = new Map();
    
    // Adicionar fontes ativas
    fontesAtivas.forEach(fonte => {
      fontesMap.set(fonte.id, {
        id: fonte.id,
        nome: fonte.nome,
        cnpj: fonte.cnpj,
        tipoVinculo: fonte.tipoVinculo,
        ativo: fonte.ativo,
        status: StatusInforme.PENDENTE,
        informe: null,
      });
    });

    // Adicionar fontes com pagamentos
    pagamentosAno.forEach(pagamento => {
      if (!fontesMap.has(pagamento.fontePagadoraId)) {
        fontesMap.set(pagamento.fontePagadoraId, {
          id: pagamento.fontePagadoraId,
          nome: pagamento.fontePagadora.nome,
          cnpj: pagamento.fontePagadora.cnpj,
          tipoVinculo: pagamento.fontePagadora.tipoVinculo,
          ativo: pagamento.fontePagadora.ativo,
          status: StatusInforme.PENDENTE,
          informe: null,
        });
      }
    });

    // Buscar informes existentes para o ano
    const informesExistentes = await this.prisma.informeRendimento.findMany({
      where: { anoRef },
      include: { fontePagadora: true },
    });

    // Atualizar status dos informes
    informesExistentes.forEach(informe => {
      if (fontesMap.has(informe.fontePagadoraId)) {
        const fonte = fontesMap.get(informe.fontePagadoraId);
        fonte.status = informe.status;
        fonte.informe = informe;
      }
    });

    return Array.from(fontesMap.values());
  }

  async uploadInforme(fontePagadoraId: string, anoRef: number, pdfKey: string) {
    // Verificar se a fonte pagadora existe
    const fontePagadora = await this.prisma.fontePagadora.findUnique({
      where: { id: fontePagadoraId },
    });

    if (!fontePagadora) {
      throw new NotFoundException('Fonte pagadora não encontrada');
    }

    // Verificar se já existe um informe para esta fonte/ano
    const informeExistente = await this.prisma.informeRendimento.findFirst({
      where: {
        fontePagadoraId,
        anoRef,
      },
    });

    if (informeExistente) {
      // Atualizar informe existente
      return this.prisma.informeRendimento.update({
        where: { id: informeExistente.id },
        data: {
          pdfKey,
          status: StatusInforme.RECEBIDO,
        },
        include: { fontePagadora: true },
      });
    } else {
      // Criar novo informe
      return this.prisma.informeRendimento.create({
        data: {
          fontePagadoraId,
          anoRef,
          pdfKey,
          status: StatusInforme.RECEBIDO,
        } as any,
        include: { fontePagadora: true },
      });
    }
  }

  async solicitarInforme(fontePagadoraId: string, anoRef: number) {
    // Verificar se a fonte pagadora existe
    const fontePagadora = await this.prisma.fontePagadora.findUnique({
      where: { id: fontePagadoraId },
    });

    if (!fontePagadora) {
      throw new NotFoundException('Fonte pagadora não encontrada');
    }

    // Verificar se já existe um informe para esta fonte/ano
    const informeExistente = await this.prisma.informeRendimento.findFirst({
      where: {
        fontePagadoraId,
        anoRef,
      },
    });

    if (informeExistente) {
      // Atualizar status para SOLICITADO
      return this.prisma.informeRendimento.update({
        where: { id: informeExistente.id },
        data: { status: StatusInforme.SOLICITADO },
        include: { fontePagadora: true },
      });
    } else {
      // Criar novo informe com status SOLICITADO
      return this.prisma.informeRendimento.create({
        data: {
          fontePagadoraId,
          anoRef,
          status: StatusInforme.SOLICITADO,
        } as any,
        include: { fontePagadora: true },
      });
    }
  }

  async gerarPresignedUrl(key: string, contentType: string) {
    return this.storageService.getPresignedPutUrl({ filename: key, contentType });
  }

  async gerarPacoteContador(anoRef: number) {
    // Buscar todos os informes do ano
    const informes = await this.prisma.informeRendimento.findMany({
      where: { anoRef },
      include: { fontePagadora: true },
    });

    // Filtrar apenas os que têm PDF
    const informesComPdf = informes.filter(informe => informe.pdfKey);

    if (informesComPdf.length === 0) {
      throw new BadRequestException('Não há informes com PDF para gerar o pacote');
    }

    // Criar arquivo ZIP
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Máxima compressão
    });

    // Adicionar cada PDF ao ZIP
    for (const informe of informesComPdf) {
      try {
        if (!informe.pdfKey) continue;
        const pdfBuffer = await this.storageService.getFile(informe.pdfKey);
        const filename = `IR_${anoRef}_${informe.fontePagadora.cnpj}_${informe.fontePagadora.nome.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
        
        archive.append(pdfBuffer, { name: filename });
      } catch (error) {
        console.error(`Erro ao adicionar PDF do informe ${informe.id}:`, error);
      }
    }

    // Gerar CSV resumo
    const csvContent = this.gerarCSVResumo(informes);
    archive.append(csvContent, { name: `resumo_IR_${anoRef}.csv` });

    return archive;
  }

  private gerarCSVResumo(informes: any[]) {
    const headers = ['CNPJ', 'Nome', 'Status', 'Data Solicitação', 'Data Recebimento'];
    const rows = informes.map(informe => [
      informe.fontePagadora.cnpj,
      `"${informe.fontePagadora.nome}"`,
      informe.status,
      informe.createdAt.toISOString().split('T')[0],
      informe.updatedAt.toISOString().split('T')[0],
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    return csvContent;
  }

  async getInforme(fontePagadoraId: string, anoRef: number) {
    const informe = await this.prisma.informeRendimento.findFirst({
      where: {
        fontePagadoraId,
        anoRef,
      },
      include: { fontePagadora: true },
    });

    if (!informe) {
      throw new NotFoundException('Informe não encontrado');
    }

    return informe;
  }

  async listarInformes(anoRef?: number) {
    const where: any = {};
    if (anoRef) {
      where.anoRef = anoRef;
    }

    return this.prisma.informeRendimento.findMany({
      where,
      include: { fontePagadora: true },
      orderBy: [
        { anoRef: 'desc' },
        { fontePagadora: { nome: 'asc' } },
      ],
    });
  }

  async atualizarAnotacoes(fontePagadoraId: string, anoRef: number, anotacoes: string) {
    const informe = await this.getInforme(fontePagadoraId, anoRef);

    return this.prisma.informeRendimento.update({
      where: { id: informe.id },
      data: { anotacoes },
      include: { fontePagadora: true },
    });
  }
}
