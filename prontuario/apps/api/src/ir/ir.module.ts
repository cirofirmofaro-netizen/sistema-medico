import { Module } from '@nestjs/common';
import { IRService } from './ir.service';
import { IRController } from './ir.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [IRController],
  providers: [IRService],
  exports: [IRService],
})
export class IRModule {}
