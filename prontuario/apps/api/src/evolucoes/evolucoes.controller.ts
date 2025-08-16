import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('evolucoes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('evolucoes')
export class EvolucoesController {
  constructor(private prisma: PrismaService) {}

  @Get('por-atendimento/:id')
  porAtendimento(@Param('id') atendimentoId: string) {
    return this.prisma.evolucao.findMany({ 
      where: { atendimentoId }, 
      orderBy: { registradoEm: 'desc' },
      include: {
        autor: true
      }
    });
  }

  @Post()
  create(@Body() dto: { atendimentoId: string; resumo: string; texto: string; authorId: string }) {
    return this.prisma.evolucao.create({
      data: { 
        atendimentoId: dto.atendimentoId, 
        resumo: dto.resumo, 
        texto: dto.texto, 
        authorId: dto.authorId 
      } as any,
      include: {
        autor: true
      }
    });
  }
}
