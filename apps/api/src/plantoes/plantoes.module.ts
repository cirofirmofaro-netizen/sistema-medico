import { Module } from '@nestjs/common';
import { PlantoesController } from './plantoes.controller';
import { PlantoesService } from './plantoes.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [PlantoesController],
  providers: [PlantoesService, PrismaService],
})
export class PlantoesModule {}
