import { Module } from '@nestjs/common';
import { MedicacoesController } from './medicacoes.controller';
import { MedicacoesService } from './medicacoes.service';
import { PrismaService } from '../prisma/prisma.service';
@Module({ controllers:[MedicacoesController], providers:[MedicacoesService, PrismaService] })
export class MedicacoesModule {}
