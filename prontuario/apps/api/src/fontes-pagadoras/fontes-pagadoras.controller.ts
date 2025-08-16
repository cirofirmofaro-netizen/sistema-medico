import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { FontesPagadorasService } from './fontes-pagadoras.service';
import { CreateFontePagadoraDto } from './dto/create-fonte-pagadora.dto';
import { UpdateFontePagadoraDto } from './dto/update-fonte-pagadora.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('fontes-pagadoras')
@UseGuards(JwtAuthGuard)
export class FontesPagadorasController {
  constructor(private readonly fontesPagadorasService: FontesPagadorasService) {}

  @Post()
  create(@Body() createFontePagadoraDto: CreateFontePagadoraDto) {
    return this.fontesPagadorasService.create(createFontePagadoraDto);
  }

  @Get()
  findAll(@Query('ativo') ativo?: string) {
    const ativoBoolean = ativo === 'true' ? true : ativo === 'false' ? false : undefined;
    return this.fontesPagadorasService.findAll(ativoBoolean);
  }

  @Get('ativas')
  findActive() {
    return this.fontesPagadorasService.getActiveFontes();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fontesPagadorasService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFontePagadoraDto: UpdateFontePagadoraDto) {
    return this.fontesPagadorasService.update(id, updateFontePagadoraDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fontesPagadorasService.remove(id);
  }
}
