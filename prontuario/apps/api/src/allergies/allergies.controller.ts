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
import { AllergiesService } from './allergies.service';
import { AllergySeverity, AllergySource, AllergyStatus } from '@prisma/client';

@ApiTags('Alergias')
@Controller('allergies')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AllergiesController {
  constructor(private readonly allergiesService: AllergiesService) {}

  @Get('allergens/search')
  @ApiOperation({ summary: 'Buscar alergenos por termo' })
  @ApiResponse({ status: 200, description: 'Lista de alergenos encontrados' })
  async searchAllergens(@Query('q') query: string, @Query('take') take?: string) {
    const takeNumber = take ? parseInt(take, 10) : 20;
    return this.allergiesService.searchAllergens(query, takeNumber);
  }

  @Get('patients/:id/allergies')
  @ApiOperation({ summary: 'Listar alergias de um paciente' })
  @ApiResponse({ status: 200, description: 'Lista de alergias do paciente' })
  async getPatientAllergies(@Param('id') patientId: string) {
    return this.allergiesService.getPatientAllergies(patientId);
  }

  @Post('patients/:id/allergies')
  @ApiOperation({ summary: 'Criar nova alergia para o paciente' })
  @ApiResponse({ status: 201, description: 'Alergia criada com sucesso' })
  async createPatientAllergy(
    @Param('id') patientId: string,
    @Body() data: {
      allergenId: string;
      severity?: AllergySeverity;
      reactions?: string;
      onsetDate?: string;
      notes?: string;
      source?: AllergySource;
      status?: AllergyStatus;
    },
    @Request() req: any,
  ) {
    const onsetDate = data.onsetDate ? new Date(data.onsetDate) : undefined;

    return this.allergiesService.createPatientAllergy(patientId, req.user.id, {
      ...data,
      onsetDate,
    });
  }

  @Put('patients/:id/allergies/:paId')
  @ApiOperation({ summary: 'Atualizar alergia do paciente' })
  @ApiResponse({ status: 200, description: 'Alergia atualizada com sucesso' })
  async updatePatientAllergy(
    @Param('id') patientId: string,
    @Param('paId') allergyId: string,
    @Body() data: {
      severity?: AllergySeverity;
      reactions?: string;
      onsetDate?: string;
      notes?: string;
      status?: AllergyStatus;
    },
    @Request() req: any,
  ) {
    const onsetDate = data.onsetDate ? new Date(data.onsetDate) : undefined;

    return this.allergiesService.updatePatientAllergy(patientId, allergyId, req.user.id, {
      ...data,
      onsetDate,
    });
  }

  @Get('patients/:id/severe-allergies')
  @ApiOperation({ summary: 'Verificar se paciente tem alergias graves ativas' })
  @ApiResponse({ status: 200, description: 'Lista de alergias graves ativas' })
  async hasSevereActiveAllergies(@Param('id') patientId: string) {
    return this.allergiesService.hasSevereActiveAllergies(patientId);
  }

  @Get('patients/:id/drug-interaction')
  @ApiOperation({ summary: 'Verificar interação medicamentosa' })
  @ApiResponse({ status: 200, description: 'Lista de interações encontradas' })
  async checkDrugInteraction(
    @Param('id') patientId: string,
    @Query('drug') drugName: string,
  ) {
    return this.allergiesService.checkDrugInteraction(patientId, drugName);
  }
}
