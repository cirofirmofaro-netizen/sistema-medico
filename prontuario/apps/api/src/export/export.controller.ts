import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ExportService } from './export.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('export')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('export')
export class ExportController {
  constructor(private service: ExportService) {}

  @Get('prontuario')
  exportProntuario(
    @Query('pacienteId') pacienteId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('incluirAnexos') incluirAnexos?: boolean,
  ) {
    return this.service.exportProntuario({
      pacienteId,
      from,
      to,
      incluirAnexos: incluirAnexos === true,
    });
  }
}
