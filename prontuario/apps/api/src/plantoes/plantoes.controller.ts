import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { PlantoesService } from './plantoes.service';
import { CreatePlantaoDto } from './dto/create-plantao.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('plantoes')
@UseGuards(JwtAuthGuard)
export class PlantoesController {
  constructor(private readonly plantoesService: PlantoesService) {}

  @Post()
  create(@Body() createPlantaoDto: CreatePlantaoDto) {
    return this.plantoesService.create(createPlantaoDto);
  }

  @Post('avulso')
  criarAvulso(@Body() data: {
    fontePagadoraId: string;
    data: string;
    inicio: string;
    fim: string;
    local: string;
    cnpj: string;
    valorPrevisto: number;
    tipoVinculo: any;
  }) {
    return this.plantoesService.criarPlantaoAvulso(data);
  }

  @Get()
  findAll(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('status') status?: string,
    @Query('fonte') fonte?: string,
  ) {
    return this.plantoesService.findAll({
      from,
      to,
      status: status as any,
      fontePagadoraId: fonte,
    });
  }

  @Get('resumo')
  getResumo(
    @Query('ano') ano?: string,
    @Query('mes') mes?: string,
  ) {
    const anoNum = ano ? parseInt(ano) : undefined;
    const mesNum = mes ? parseInt(mes) : undefined;
    return this.plantoesService.getResumoPlantoes(anoNum, mesNum);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.plantoesService.findOne(id);
  }

  @Patch(':id/realizar')
  marcarRealizado(@Param('id') id: string) {
    return this.plantoesService.marcarRealizado(id);
  }

  @Patch(':id/troca')
  registrarTroca(
    @Param('id') id: string,
    @Body() data: {
      trocaCom: string;
      motivo: string;
      reagendadoPara?: string;
    },
  ) {
    return this.plantoesService.registrarTroca(id, data);
  }

  @Delete(':id')
  cancelar(@Param('id') id: string) {
    return this.plantoesService.cancelar(id);
  }
}
