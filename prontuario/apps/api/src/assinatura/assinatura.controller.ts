import { Body, Controller, Get, Param, Post, Req, Headers, UnauthorizedException, ConflictException, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AssinaturaService } from './assinatura.service';
import { OcspService } from './ocsp.service';
import { PrismaService } from '../prisma/prisma.service';
import type { Request } from 'express';
import { createHmac, timingSafeEqual } from 'crypto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '@prisma/client';

@ApiTags('assinatura')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.MEDICO, UserRole.ADMIN)
@Controller('assinatura')
export class AssinaturaController {
  constructor(
    private service: AssinaturaService, 
    private ocsp: OcspService,
    private prisma: PrismaService
  ) {}

  // Verificação HMAC segura contra timing attacks
  private verifyHmac(secret: string, raw: string, sig?: string): boolean {
    if (!sig) return false;
    const mac = createHmac('sha256', secret).update(raw).digest('hex');
    try { 
      return timingSafeEqual(Buffer.from(sig), Buffer.from(mac)); 
    } catch { 
      return false; 
    }
  }

  // 1) App/Backoffice chama para obter o HASH que deve ser assinado
  @Post(':id/request')
  async request(@Param('id') id: string, @Req() req: any) {
    const out = await this.service.signRequest(id, req.ip, req.headers['user-agent']);
    
    // Auditoria
    await this.prisma.assinaturaEvento.create({ 
      data: {
        documentoId: id, 
        tipo: 'REQUEST', 
        ip: req.ip, 
        userAgent: req.headers['user-agent'] ?? null,
        payloadResumo: { 
          hashAlgo: out.hashAlgo, 
          callbackUrl: out.callbackUrl 
        }
      }
    });
    
    return out;
  }

  // 2) Provedor de assinatura chama esse callback (ou seu app repassa)
  @Post(':id/callback')
  async callback(
    @Param('id') id: string,
    @Body() body: {
      formato: 'PAdES' | 'CMS',
      assinaturaBase64: string,
      certificadoPem?: string,
      cadeiaPem?: string[],
      algoritimo?: string,
      signerName?: string,
      timestampToken?: string
    },
    @Req() req: any,
    @Headers('x-signature') signature: string,
    @Headers('idempotency-key') idemKey: string
  ) {
    // HMAC - Obrigatório
    const secret = process.env.SIGN_WEBHOOK_SECRET;
    if (!secret) {
      throw new UnauthorizedException('Webhook secret not configured');
    }
    
    const raw = req.rawBody?.toString() ?? JSON.stringify(body);
    const ok = this.verifyHmac(secret, raw, signature);
    if (!ok) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    // Idempotência - Obrigatório
    if (!idemKey) {
      throw new ConflictException('Missing Idempotency-Key');
    }
    
    try {
      await this.prisma.webhookIdem.create({ data: { key: idemKey } });
    } catch {
      throw new ConflictException('Duplicate callback (idempotent)');
    }

    // Auditoria (pré-processamento)
    await this.prisma.assinaturaEvento.create({ 
      data: {
        documentoId: id, 
        tipo: 'CALLBACK', 
        ip: req.ip, 
        userAgent: req.headers['user-agent'] ?? null,
        payloadResumo: { 
          formato: body.formato, 
          signerName: body.signerName ?? null,
          hasCertificado: !!body.certificadoPem,
          hasTimestamp: !!body.timestampToken
        }
      }
    });

    // Processa assinatura
    const res = await this.service.signCallback(id, body, req.ip, req.headers['user-agent'], signature);
    return res;
  }

  // 3) Obter URL do artefato assinado
  @Get(':id/url')
  signed(@Param('id') id: string) {
    return this.service.signedUrl(id);
  }

  // 4) Validar certificado manualmente
  @Post(':id/validate')
  async validate(@Param('id') id: string) {
    // TODO: Implementar validação manual via OcspService
    return { status: 'Validação iniciada', documentoId: id };
  }

  // 5) Revalidar certificado (útil para testes)
  @Post(':id/revalidate')
  async revalidate(@Param('id') id: string) {
    const status = await this.ocsp.validateOne(id);
    return { 
      status: 'Revalidação concluída', 
      documentoId: id, 
      certStatus: status 
    };
  }
}
