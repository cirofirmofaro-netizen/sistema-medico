import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AtendimentosService } from './atendimentos.service';

@ApiTags('Atendimentos')
@Controller('atendimentos')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AtendimentosController {
  constructor(private readonly atendimentosService: AtendimentosService) {}

  @Get('patients/:patientId')
  @ApiOperation({ summary: 'Listar atendimentos de um paciente' })
  @ApiResponse({ status: 200, description: 'Lista de atendimentos' })
  async listPatientAtendimentos(
    @Param('patientId') patientId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;

    return this.atendimentosService.listPatientAtendimentos(
      patientId,
      fromDate,
      toDate,
    );
  }

  @Post('patients/:patientId/evolucoes')
  @ApiOperation({ summary: 'Criar nova evolução' })
  @ApiResponse({ status: 201, description: 'Evolução criada com sucesso' })
  async createEvolucao(
    @Param('patientId') patientId: string,
    @Body() data: {
      resumo?: string;
      texto: string;
      when?: string;
    },
    @Request() req: any,
  ) {
    console.log('Creating evolution - req.user:', req.user);
    console.log('Creating evolution - data:', data);
    
    const when = data.when ? new Date(data.when) : undefined;

    return this.atendimentosService.createEvolucao(
      patientId,
      req.user.id,
      {
        resumo: data.resumo,
        texto: data.texto,
        when,
      },
    );
  }

  @Put('evolucoes/:id')
  @ApiOperation({ summary: 'Atualizar evolução (com versionamento)' })
  @ApiResponse({ status: 200, description: 'Evolução atualizada com sucesso' })
  async updateEvolucao(
    @Param('id') evolucaoId: string,
    @Body() data: {
      resumo?: string;
      texto: string;
    },
    @Request() req: any,
  ) {
    return this.atendimentosService.updateEvolucao(
      evolucaoId,
      req.user.id,
      data,
    );
  }

  @Get('evolucoes/:id')
  @ApiOperation({ summary: 'Obter uma evolução específica' })
  @ApiResponse({ status: 200, description: 'Evolução encontrada' })
  async getEvolucao(@Param('id') evolucaoId: string) {
    return this.atendimentosService.getEvolucao(evolucaoId);
  }

  @Post('patients/:patientId/sinais-vitais')
  @ApiOperation({ summary: 'Criar sinais vitais' })
  @ApiResponse({ status: 201, description: 'Sinais vitais criados com sucesso' })
  async createSinaisVitais(
    @Param('patientId') patientId: string,
    @Body() data: {
      pressaoSistolica: number;
      pressaoDiastolica: number;
      frequenciaCardiaca: number;
      frequenciaRespiratoria: number;
      saturacaoOxigenio: number;
      temperatura: number;
      peso?: number;
      altura?: number;
      observacoes?: string;
      when?: string;
    },
    @Request() req: any,
  ) {
    const when = data.when ? new Date(data.when) : undefined;

    return this.atendimentosService.createSinaisVitais(
      patientId,
      req.user.id,
      {
        ...data,
        when,
      },
    );
  }

  @Put('sinais-vitais/:id')
  @ApiOperation({ summary: 'Atualizar sinais vitais' })
  @ApiResponse({ status: 200, description: 'Sinais vitais atualizados com sucesso' })
  async updateSinaisVitais(
    @Param('id') sinaisVitaisId: string,
    @Body() data: {
      pressaoSistolica?: number;
      pressaoDiastolica?: number;
      frequenciaCardiaca?: number;
      frequenciaRespiratoria?: number;
      saturacaoOxigenio?: number;
      temperatura?: number;
      peso?: number;
      altura?: number;
      observacoes?: string;
    },
    @Request() req: any,
  ) {
    return this.atendimentosService.updateSinaisVitais(
      sinaisVitaisId,
      req.user.id,
      data,
    );
  }

  @Get('sinais-vitais/:id')
  @ApiOperation({ summary: 'Obter sinais vitais específicos' })
  @ApiResponse({ status: 200, description: 'Sinais vitais encontrados' })
  async getSinaisVitais(@Param('id') sinaisVitaisId: string) {
    return this.atendimentosService.getSinaisVitais(sinaisVitaisId);
  }

  @Post('patients/:patientId/anexos')
  @ApiOperation({ summary: 'Criar anexo' })
  @ApiResponse({ status: 201, description: 'Anexo criado com sucesso' })
  async createAnexo(
    @Param('patientId') patientId: string,
    @Body() data: {
      filename: string;
      mimeType: string;
      size: number;
      storageKey: string;
      urlPublica?: string;
      titulo?: string;
      tipoDocumento?: string;
      when?: string;
    },
    @Request() req: any,
  ) {
    const when = data.when ? new Date(data.when) : undefined;

    return this.atendimentosService.createAnexo(
      patientId,
      req.user.id,
      {
        ...data,
        when,
      },
    );
  }

  @Post(':id/finalizar')
  @ApiOperation({ summary: 'Finalizar atendimento do dia' })
  @ApiResponse({ status: 200, description: 'Atendimento finalizado com sucesso' })
  async finalizarAtendimento(
    @Param('id') atendimentoId: string,
    @Request() req: any,
  ) {
    return this.atendimentosService.finalizarAtendimento(
      atendimentoId,
      req.user.id,
    );
  }

  @Get('evolucoes/:id/versions')
  @ApiOperation({ summary: 'Obter histórico de versões de uma evolução' })
  @ApiResponse({ status: 200, description: 'Histórico de versões' })
  async getEvolucaoVersions(@Param('id') evolucaoId: string) {
    return this.atendimentosService.getEvolucaoVersions(evolucaoId);
  }

  @Get('patients/:patientId/sinais-vitais')
  @ApiOperation({ summary: 'Listar sinais vitais de um paciente' })
  @ApiResponse({ status: 200, description: 'Lista de sinais vitais' })
  async listSinaisVitais(@Param('patientId') patientId: string) {
    return this.atendimentosService.listSinaisVitais(patientId);
  }

  @Get('patients/:patientId/anexos')
  @ApiOperation({ summary: 'Listar anexos de um paciente' })
  @ApiResponse({ status: 200, description: 'Lista de anexos' })
  async listAnexos(@Param('patientId') patientId: string) {
    return this.atendimentosService.listAnexos(patientId);
  }

  @Get('patients/:patientId/evolucoes')
  @ApiOperation({ summary: 'Listar evoluções de um paciente' })
  @ApiResponse({ status: 200, description: 'Lista de evoluções' })
  async listEvolucoes(@Param('patientId') patientId: string) {
    return this.atendimentosService.listEvolucoes(patientId);
  }
}
