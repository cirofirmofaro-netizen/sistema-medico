import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PagamentosService } from './pagamentos.service';
import { CreatePagamentoDto } from './dto/create-pagamento.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('pagamentos')
@UseGuards(JwtAuthGuard)
export class PagamentosController {
  constructor(private readonly pagamentosService: PagamentosService) {}

  @Post()
  create(@Body() createPagamentoDto: CreatePagamentoDto) {
    return this.pagamentosService.create(createPagamentoDto);
  }

  @Post('registrar')
  registrarPagamento(@Body() data: {
    plantaoId?: string;
    fontePagadoraId: string;
    competencia: string;
    valorPago: number;
    dataPagamento?: Date;
    meio: any;
    valorPrevisto?: number;
  }) {
    return this.pagamentosService.registrarPagamento(data);
  }

  @Get()
  findAll(
    @Query('competencia') competencia?: string,
    @Query('fonte') fonte?: string,
    @Query('status') status?: string,
  ) {
    return this.pagamentosService.findAll({
      competencia,
      fontePagadoraId: fonte,
      status: status as any,
    });
  }

  @Get('resumo')
  getResumoFinanceiro(
    @Query('ano') ano?: string,
    @Query('mes') mes?: string,
  ) {
    const anoNum = ano ? parseInt(ano) : undefined;
    const mesNum = mes ? parseInt(mes) : undefined;
    return this.pagamentosService.getResumoFinanceiro(anoNum, mesNum);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pagamentosService.findOne(id);
  }

  @Get('plantoes/:plantaoId')
  findByPlantao(@Param('plantaoId') plantaoId: string) {
    return this.pagamentosService.findByPlantao(plantaoId);
  }
}
