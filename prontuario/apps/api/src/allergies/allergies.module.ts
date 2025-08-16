import { Module } from '@nestjs/common';
import { AllergiesController } from './allergies.controller';
import { AllergiesService } from './allergies.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AllergiesController],
  providers: [AllergiesService],
  exports: [AllergiesService],
})
export class AllergiesModule {}
