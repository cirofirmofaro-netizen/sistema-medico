import { Module } from '@nestjs/common';
import { FontesPagadorasService } from './fontes-pagadoras.service';
import { FontesPagadorasController } from './fontes-pagadoras.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FontesPagadorasController],
  providers: [FontesPagadorasService],
  exports: [FontesPagadorasService],
})
export class FontesPagadorasModule {}
