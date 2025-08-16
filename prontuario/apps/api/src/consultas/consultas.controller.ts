import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiQuery, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { ConsultasService } from './consultas.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '@prisma/client';

@ApiTags('consultas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.MEDICO, UserRole.ADMIN)
@Controller('appointments')
export class ConsultasController {
  constructor(private service: ConsultasService) {}

  @ApiQuery({ name: 'from', required: false, example: '2025-01-01' })
  @ApiQuery({ name: 'to', required: false, example: '2025-12-31' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @Get()
  list(@Query('from') from?: string, @Query('to') to?: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.service.list({ from, to, page, limit });
  }

  @Post()
  create(@Body() data: any) {
    return this.service.create(data);
  }

  @Get(':id')
  byId(@Param('id') id: string) {
    return this.service.byId(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
