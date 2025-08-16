import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ConditionsService } from './conditions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiQuery, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('conditions')
@Controller('conditions')
@UseGuards(JwtAuthGuard)
export class ConditionsController {
  constructor(private readonly conditionsService: ConditionsService) {}

  @Get('search')
  @ApiQuery({ name: 'q', description: 'Query de busca' })
  @ApiOperation({ summary: 'Buscar condições por nome, sinônimos ou ICD-10' })
  @ApiResponse({ status: 200, description: 'Lista de condições encontradas' })
  async searchConditions(@Query('q') query: string) {
    return this.conditionsService.searchConditions(query);
  }

  @Get('patients/:patientId/conditions')
  @ApiOperation({ summary: 'Listar condições do paciente' })
  @ApiResponse({ status: 200, description: 'Lista de condições do paciente' })
  async getPatientConditions(@Param('patientId') patientId: string) {
    return this.conditionsService.getPatientConditions(patientId);
  }

  @Post('patients/:patientId/conditions')
  @ApiOperation({ summary: 'Adicionar condição ao paciente' })
  @ApiResponse({ status: 201, description: 'Condição adicionada com sucesso' })
  async createPatientCondition(
    @Param('patientId') patientId: string,
    @Body() data: any
  ) {
    return this.conditionsService.createPatientCondition(patientId, data);
  }

  @Put('patients/:patientId/conditions/:pcId')
  @ApiOperation({ summary: 'Atualizar condição do paciente' })
  @ApiResponse({ status: 200, description: 'Condição atualizada com sucesso' })
  async updatePatientCondition(
    @Param('patientId') patientId: string,
    @Param('pcId') pcId: string,
    @Body() data: any
  ) {
    return this.conditionsService.updatePatientCondition(patientId, pcId, data);
  }

  @Post('patients/:patientId/conditions/:pcId/occurrences')
  @ApiOperation({ summary: 'Adicionar ocorrência à condição' })
  @ApiResponse({ status: 201, description: 'Ocorrência adicionada com sucesso' })
  async createOccurrence(
    @Param('patientId') patientId: string,
    @Param('pcId') pcId: string,
    @Body() data: any
  ) {
    return this.conditionsService.createOccurrence(patientId, pcId, data);
  }

  @Put('patients/:patientId/conditions/:pcId/occurrences/:occId')
  @ApiOperation({ summary: 'Atualizar ocorrência da condição' })
  @ApiResponse({ status: 200, description: 'Ocorrência atualizada com sucesso' })
  async updateOccurrence(
    @Param('patientId') patientId: string,
    @Param('pcId') pcId: string,
    @Param('occId') occId: string,
    @Body() data: any
  ) {
    return this.conditionsService.updateOccurrence(patientId, pcId, occId, data);
  }
}
