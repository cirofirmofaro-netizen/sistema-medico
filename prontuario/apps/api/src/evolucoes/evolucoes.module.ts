import { Module } from '@nestjs/common';
import { EvolucoesController } from './evolucoes.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({ 
  controllers: [EvolucoesController], 
  providers: [PrismaService] 
})
export class EvolucoesModule {}
