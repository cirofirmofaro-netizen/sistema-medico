import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DocumentosService } from './documentos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '@prisma/client';

@ApiTags('documentos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.MEDICO, UserRole.ADMIN)
@Controller('documentos')
export class DocumentosController {
  constructor(private service: DocumentosService) {}

  @Post('receita')
  receita(@Body() b: {
    pacienteId: string;
    evolucaoId?: string;
    itens: { medicamento: string; posologia: string; quantidade?: string }[];
    observacoes?: string;
    assinaturaImagemBase64?: string;
  }) {
    return this.service.receita(b);
  }

  // (Opcional) atestado – estrutura similar à receita, com corpo de texto livre … posso te mandar depois

  @Get(':id/url')
  url(@Param('id') id: string) {
    return this.service.presignGet(id);
  }

  // rota "verify" (QR) — por enquanto estática
  @Get('verify')
  verifyInfo() {
    return { ok: true, msg: 'Exemplo de verificação. Em produção, retornaríamos metadados (hash, horário, paciente parcial, etc.)' };
  }
}
