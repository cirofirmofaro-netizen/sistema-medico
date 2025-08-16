import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '@prisma/client';

@ApiTags('episodios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.MEDICO, UserRole.ADMIN)
@Controller('episodios')
export class EpisodiosController {
  constructor(private prisma: PrismaService) {}

  @Post()
  create(@Body() dto: { pacienteId: string; tipo: string }) {
    return this.prisma.episodio.create({ data: { pacienteId: dto.pacienteId, tipo: dto.tipo } as any });
  }

  @Get('por-paciente/:id')
  porPaciente(@Param('id') pacienteId: string) {
    return this.prisma.episodio.findMany({ where: { pacienteId }, orderBy: { abertoEm: 'desc' } });
  }
}
