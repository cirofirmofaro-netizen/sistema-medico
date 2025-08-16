import { Module } from '@nestjs/common';
import { PagamentosService } from './pagamentos.service';
import { PagamentosController } from './pagamentos.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PagamentosController],
  providers: [PagamentosService],
  exports: [PagamentosService],
})
export class PagamentosModule {}
