import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ProblemasService } from './problemas.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '@prisma/client';
import { CreateProblemaDto } from './dto/create-problema.dto';
import { UpdateProblemaDto } from './dto/update-problema.dto';

@ApiTags('problemas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.MEDICO, UserRole.ADMIN)
@Controller('problemas')
export class ProblemasController {
  constructor(private service: ProblemasService) {}
  @Get('por-paciente/:id') list(@Param('id') id: string) { return this.service.porPaciente(id); }
  @Post() create(@Body() dto: CreateProblemaDto) { return this.service.create(dto); }
  @Put(':id') update(@Param('id') id: string, @Body() dto: UpdateProblemaDto) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id); }
}
