import { Module } from '@nestjs/common';
import { AtendimentosController } from './atendimentos.controller';
import { AtendimentosService } from './atendimentos.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AtendimentosController],
  providers: [AtendimentosService],
  exports: [AtendimentosService],
})
export class AtendimentosModule {}
