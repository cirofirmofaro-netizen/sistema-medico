import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiQuery, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { PacientesService } from './pacientes.service';
import { CreatePacienteDto } from './dto/create-paciente.dto';
import { UpdatePacienteDto } from './dto/update-paciente.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '@prisma/client';

@ApiTags('pacientes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.MEDICO, UserRole.ADMIN)
@Controller('pacientes')
export class PacientesController {
  constructor(private service: PacientesService) {}

  @ApiQuery({ name: 'search', required: false, example: 'Ana' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @Get()
  list(@Query('search') search?: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.service.list({ search, page, limit });
  }

  @ApiBody({ type: CreatePacienteDto })
  @Post()
  create(@Body() dto: CreatePacienteDto) {
    return this.service.create(dto);
  }

  @Get(':id')
  byId(@Param('id') id: string) {
    return this.service.byId(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePacienteDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
