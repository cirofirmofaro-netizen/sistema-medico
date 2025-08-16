import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RetentionService } from './retention.service';

@ApiTags('retenção')
@ApiBearerAuth()
@Controller('retention')
@UseGuards(JwtAuthGuard)
export class RetentionController {
  constructor(private readonly retentionService: RetentionService) {}

  @Get('anexo/:anexoId/can-delete')
  @ApiOperation({ summary: 'Verificar se anexo pode ser excluído' })
  @ApiResponse({ status: 200, description: 'Verificação realizada' })
  async canDeleteAnexo(@Param('anexoId') anexoId: string) {
    return this.retentionService.canDeleteAnexo(anexoId);
  }

  @Post('anexo/:anexoId/soft-delete')
  @ApiOperation({ summary: 'Aplicar soft delete em anexo' })
  @ApiResponse({ status: 200, description: 'Soft delete aplicado' })
  async softDeleteAnexo(
    @Param('anexoId') anexoId: string,
    @Body() data: { deletedBy: string }
  ) {
    return this.retentionService.softDeleteAnexo(anexoId, data.deletedBy);
  }

  @Post('anexo/:anexoId/legal-hold')
  @ApiOperation({ summary: 'Aplicar legal hold em anexo' })
  @ApiResponse({ status: 200, description: 'Legal hold aplicado' })
  async setLegalHold(
    @Param('anexoId') anexoId: string,
    @Body() data: { reason: string; setBy: string }
  ) {
    await this.retentionService.setLegalHold(anexoId, data.reason, data.setBy);
    return { success: true };
  }

  @Delete('anexo/:anexoId/legal-hold')
  @ApiOperation({ summary: 'Remover legal hold de anexo' })
  @ApiResponse({ status: 200, description: 'Legal hold removido' })
  async removeLegalHold(
    @Param('anexoId') anexoId: string,
    @Body() data: { removedBy: string }
  ) {
    await this.retentionService.removeLegalHold(anexoId, data.removedBy);
    return { success: true };
  }

  @Get('expurgable')
  @ApiOperation({ summary: 'Listar anexos que podem ser expurgados' })
  @ApiResponse({ status: 200, description: 'Lista de anexos expurgáveis' })
  async getExpurgableAnexos() {
    return this.retentionService.getExpurgableAnexos();
  }

  @Post('expurge')
  @ApiOperation({ summary: 'Expurgar anexos antigos (apenas administradores)' })
  @ApiResponse({ status: 200, description: 'Expurgo realizado' })
  async expurgeAnexos(@Body() data: { expurgedBy: string }) {
    return this.retentionService.expurgeAnexos(data.expurgedBy);
  }
}
