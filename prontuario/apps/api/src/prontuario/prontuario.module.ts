import { Module } from '@nestjs/common';
import { ProntuarioController } from './prontuario.controller';
import { ProntuarioService } from './prontuario.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProntuarioController],
  providers: [ProntuarioService]
})
export class ProntuarioModule {}
