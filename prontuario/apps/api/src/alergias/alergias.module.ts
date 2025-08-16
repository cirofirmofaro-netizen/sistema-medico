import { Module } from '@nestjs/common';
import { AlergiasController } from './alergias.controller';
import { AlergiasService } from './alergias.service';
import { PrismaService } from '../prisma/prisma.service';
@Module({ controllers:[AlergiasController], providers:[AlergiasService, PrismaService] })
export class AlergiasModule {}
