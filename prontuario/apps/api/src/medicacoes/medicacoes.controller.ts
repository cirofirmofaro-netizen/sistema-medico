import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { MedicacoesService } from './medicacoes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '@prisma/client';
import { CreateMedicacaoDto } from './dto/create-medicacao.dto';
import { UpdateMedicacaoDto } from './dto/update-medicacao.dto';

@ApiTags('medicacoes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.MEDICO, UserRole.ADMIN)
@Controller('medicacoes')
export class MedicacoesController {
  constructor(private service: MedicacoesService) {}
  @Get('por-paciente/:id') list(@Param('id') id: string) { return this.service.porPaciente(id); }
  @Post() create(@Body() dto: CreateMedicacaoDto) { return this.service.create(dto); }
  @Put(':id') update(@Param('id') id: string, @Body() dto: UpdateMedicacaoDto) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id); }
}
