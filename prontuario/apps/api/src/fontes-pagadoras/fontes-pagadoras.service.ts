import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFontePagadoraDto } from './dto/create-fonte-pagadora.dto';
import { UpdateFontePagadoraDto } from './dto/update-fonte-pagadora.dto';

@Injectable()
export class FontesPagadorasService {
  constructor(private prisma: PrismaService) {}

  async create(createFontePagadoraDto: CreateFontePagadoraDto) {
    // Verificar se já existe uma fonte pagadora com o mesmo CNPJ para este usuário
    const existingFonte = await this.prisma.fontePagadora.findFirst({
      where: { cnpj: createFontePagadoraDto.cnpj },
    });

    if (existingFonte) {
      throw new ConflictException('Já existe uma fonte pagadora com este CNPJ');
    }

    return this.prisma.fontePagadora.create({
      data: {
        nome: createFontePagadoraDto.nome,
        cnpj: createFontePagadoraDto.cnpj,
        tipoVinculo: createFontePagadoraDto.tipoVinculo,
        contatoEmail: createFontePagadoraDto.contatoEmail,
        contatoFone: createFontePagadoraDto.contatoFone,
        inicio: createFontePagadoraDto.inicio ? new Date(createFontePagadoraDto.inicio) : new Date(),
        fim: createFontePagadoraDto.fim ? new Date(createFontePagadoraDto.fim) : null,
        ativo: createFontePagadoraDto.ativo ?? true,
      } as any,
    });
  }

  async findAll(ativo?: boolean) {
    const where = ativo !== undefined ? { ativo } : {};
    
    return this.prisma.fontePagadora.findMany({
      where,
      include: {
        _count: {
          select: {
            modelosPlantao: true,
            plantoes: true,
            pagamentos: true,
          },
        },
      },
      orderBy: { nome: 'asc' },
    });
  }

  async findOne(id: string) {
    const fontePagadora = await this.prisma.fontePagadora.findUnique({
      where: { id },
      include: {
        modelosPlantao: true,
        plantoes: {
          take: 10,
          orderBy: { data: 'desc' },
        },
        pagamentos: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        informesRendimento: {
          orderBy: { anoRef: 'desc' },
        },
      },
    });

    if (!fontePagadora) {
      throw new NotFoundException('Fonte pagadora não encontrada');
    }

    return fontePagadora;
  }

  async update(id: string, updateFontePagadoraDto: UpdateFontePagadoraDto) {
    // Verificar se a fonte pagadora existe
    await this.findOne(id);

    // Se estiver atualizando o CNPJ, verificar se não conflita
    if (updateFontePagadoraDto.cnpj) {
      const existingFonte = await this.prisma.fontePagadora.findFirst({
        where: {
          cnpj: updateFontePagadoraDto.cnpj,
          id: { not: id },
        },
      });

      if (existingFonte) {
        throw new ConflictException('Já existe uma fonte pagadora com este CNPJ');
      }
    }

    return this.prisma.fontePagadora.update({
      where: { id },
      data: {
        ...updateFontePagadoraDto,
        inicio: updateFontePagadoraDto.inicio ? new Date(updateFontePagadoraDto.inicio) : undefined,
        fim: updateFontePagadoraDto.fim ? new Date(updateFontePagadoraDto.fim) : undefined,
      },
    });
  }

  async remove(id: string) {
    // Verificar se a fonte pagadora existe
    await this.findOne(id);

    // Soft delete - apenas marca como inativo
    return this.prisma.fontePagadora.update({
      where: { id },
      data: { ativo: false },
    });
  }

  async findByCnpj(cnpj: string) {
    return this.prisma.fontePagadora.findFirst({
      where: { cnpj },
    });
  }

  async getActiveFontes() {
    return this.prisma.fontePagadora.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' },
    });
  }
}
