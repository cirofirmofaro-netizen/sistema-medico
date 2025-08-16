import { Module } from '@nestjs/common';
import { PlantoesService } from './plantoes.service';
import { PlantoesController } from './plantoes.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PlantoesController],
  providers: [PlantoesService],
  exports: [PlantoesService],
})
export class PlantoesModule {}
