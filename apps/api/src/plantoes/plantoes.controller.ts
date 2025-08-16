import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { PlantoesService } from './plantoes.service';
import { CreatePlantaoDto } from './dto/create-plantao.dto';
import { UpdatePlantaoDto } from './dto/update-plantao.dto';
import { ListPlantoesDto } from './dto/list-plantoes.dto';
import { RegistrarPagamentoDto } from './dto/registrar-pagamento.dto';

@Controller('plantoes')
export class PlantoesController {
  constructor(private readonly service: PlantoesService) {}

  @Post()
  create(@Body() dto: CreatePlantaoDto) {
    return this.service.create(dto);
  }

  @Get()
  list(@Query() q: ListPlantoesDto) {
    return this.service.list(q);
  }

  @Get(':id')
  byId(@Param('id') id: string) {
    return this.service.byId(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePlantaoDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post(':id/pagamentos')
  pagar(@Param('id') id: string, @Body() dto: RegistrarPagamentoDto) {
    return this.service.pagar(id, dto);
  }
}
