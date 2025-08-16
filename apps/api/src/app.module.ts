import { Module } from '@nestjs/common';
import { PlantoesModule } from './plantoes/plantoes.module';

@Module({
  imports: [PlantoesModule],
})
export class AppModule {}
