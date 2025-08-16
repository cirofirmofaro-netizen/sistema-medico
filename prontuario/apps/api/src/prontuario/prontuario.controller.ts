import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ProntuarioService } from './prontuario.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('prontuario')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('prontuario')
export class ProntuarioController {
  constructor(private service: ProntuarioService) {}

  // Evoluções (Notes)
  @Get('patients/:patientId/notes')
  listNotes(@Param('patientId') patientId: string) {
    return this.service.listNotes(patientId);
  }

  @Post('patients/:patientId/notes')
  createNote(@Param('patientId') patientId: string, @Body() data: any) {
    return this.service.createNote(patientId, data);
  }

  @Put('notes/:id')
  updateNote(@Param('id') id: string, @Body() data: any) {
    return this.service.updateNote(id, data);
  }

  // Sinais Vitais (Vitals)
  @Get('patients/:patientId/vitals')
  listVitals(@Param('patientId') patientId: string) {
    return this.service.listVitals(patientId);
  }

  @Post('patients/:patientId/vitals')
  createVitals(@Param('patientId') patientId: string, @Body() data: any) {
    return this.service.createVitals(patientId, data);
  }

  // Anexos (Files)
  @Get('patients/:patientId/files')
  listFiles(@Param('patientId') patientId: string) {
    return this.service.listFiles(patientId);
  }

  @Post('patients/:patientId/files')
  createFile(@Param('patientId') patientId: string, @Body() data: any) {
    return this.service.createFile(patientId, data);
  }
}
