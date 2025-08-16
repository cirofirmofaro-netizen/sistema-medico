import { Module } from '@nestjs/common';
import { AnexosController } from './anexos.controller';
import { AnexosService } from './anexos.service';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { RetentionModule } from '../retention/retention.module';

@Module({
  imports: [PrismaModule, StorageModule, RetentionModule],
  controllers: [AnexosController],
  providers: [AnexosService],
  exports: [AnexosService],
})
export class AnexosModule {}
