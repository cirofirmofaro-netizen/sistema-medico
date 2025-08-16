import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AlergiasService } from './alergias.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '@prisma/client';
import { CreateAlergiaDto } from './dto/create-alergia.dto';
import { UpdateAlergiaDto } from './dto/update-alergia.dto';

@ApiTags('alergias')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.MEDICO, UserRole.ADMIN)
@Controller('alergias')
export class AlergiasController {
  constructor(private service: AlergiasService) {}
  @Get('por-paciente/:id') list(@Param('id') id: string) { return this.service.porPaciente(id); }
  @Post() create(@Body() dto: CreateAlergiaDto) { return this.service.create(dto); }
  @Put(':id') update(@Param('id') id: string, @Body() dto: UpdateAlergiaDto) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id); }
}
