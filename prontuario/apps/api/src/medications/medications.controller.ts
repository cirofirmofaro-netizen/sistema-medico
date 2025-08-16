import { Controller, Get, Post, Put, Param, Body, UseGuards } from '@nestjs/common';
import { MedicationsService } from './medications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('medications')
@Controller('medications')
@UseGuards(JwtAuthGuard)
export class MedicationsController {
  constructor(private readonly medicationsService: MedicationsService) {}

  @Get('patients/:patientId/medications')
  @ApiOperation({ summary: 'Listar medicamentos do paciente' })
  @ApiResponse({ status: 200, description: 'Lista de medicamentos do paciente' })
  async getPatientMedications(@Param('patientId') patientId: string) {
    return this.medicationsService.getPatientMedications(patientId);
  }

  @Post('patients/:patientId/medications')
  @ApiOperation({ summary: 'Adicionar medicamento ao paciente' })
  @ApiResponse({ status: 201, description: 'Medicamento adicionado com sucesso' })
  async createMedication(
    @Param('patientId') patientId: string,
    @Body() data: any
  ) {
    return this.medicationsService.createMedication(patientId, data);
  }

  @Put('patients/:patientId/medications/:medId')
  @ApiOperation({ summary: 'Atualizar medicamento do paciente' })
  @ApiResponse({ status: 200, description: 'Medicamento atualizado com sucesso' })
  async updateMedication(
    @Param('patientId') patientId: string,
    @Param('medId') medId: string,
    @Body() data: any
  ) {
    return this.medicationsService.updateMedication(patientId, medId, data);
  }
}
