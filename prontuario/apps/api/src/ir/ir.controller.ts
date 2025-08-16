import { Controller, Get, Post, Body, Param, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { IRService } from './ir.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ir')
@UseGuards(JwtAuthGuard)
export class IRController {
  constructor(private readonly irService: IRService) {}

  @Get('checklist')
  gerarChecklist(@Query('ano') ano: string) {
    const anoRef = parseInt(ano) || new Date().getFullYear();
    return this.irService.gerarChecklist(anoRef);
  }

  @Post('solicitar')
  solicitarInforme(@Body() data: { fontePagadoraId: string; anoRef: number }) {
    return this.irService.solicitarInforme(data.fontePagadoraId, data.anoRef);
  }

  @Post('upload-informe/presign')
  async uploadInformePresign(@Body() data: {
    fontePagadoraId: string;
    anoRef: number;
    filename: string;
    contentType: string;
    size: number;
  }) {
    // Gerar chave para o arquivo
    const key = `ir/${data.anoRef}/${data.fontePagadoraId}/${Date.now()}-${data.filename}`;
    
    // Gerar URL assinada para upload
    const putUrl = await this.irService.gerarPresignedUrl(key, data.contentType);
    
    return {
      key,
      putUrl,
      expires: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutos
    };
  }

  @Post('recebido')
  async receberInforme(@Body() data: {
    fontePagadoraId: string;
    anoRef: number;
    pdfKey: string;
  }) {
    return this.irService.uploadInforme(data.fontePagadoraId, data.anoRef, data.pdfKey);
  }

  @Get('pacote')
  async gerarPacote(@Query('ano') ano: string, @Res() res: Response) {
    const anoRef = parseInt(ano) || new Date().getFullYear();
    
    try {
      const archive = await this.irService.gerarPacoteContador(anoRef);
      
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="pacote_IR_${anoRef}.zip"`);
      
      archive.pipe(res);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  @Get('informes')
  listarInformes(@Query('ano') ano?: string) {
    const anoRef = ano ? parseInt(ano) : undefined;
    return this.irService.listarInformes(anoRef);
  }

  @Get('informes/:fontePagadoraId/:anoRef')
  getInforme(
    @Param('fontePagadoraId') fontePagadoraId: string,
    @Param('anoRef') anoRef: string,
  ) {
    return this.irService.getInforme(fontePagadoraId, parseInt(anoRef));
  }

  @Post('informes/:fontePagadoraId/:anoRef/anotacoes')
  atualizarAnotacoes(
    @Param('fontePagadoraId') fontePagadoraId: string,
    @Param('anoRef') anoRef: string,
    @Body() data: { anotacoes: string },
  ) {
    return this.irService.atualizarAnotacoes(fontePagadoraId, parseInt(anoRef), data.anotacoes);
  }
}
