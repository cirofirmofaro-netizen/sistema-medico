import { Module } from '@nestjs/common';
import { AssinaturaController } from './assinatura.controller';
import { AssinaturaService } from './assinatura.service';
import { OcspService } from './ocsp.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [AssinaturaController],
  providers: [AssinaturaService, OcspService, PrismaService],
  exports: [AssinaturaService, OcspService],
})
export class AssinaturaModule {}
