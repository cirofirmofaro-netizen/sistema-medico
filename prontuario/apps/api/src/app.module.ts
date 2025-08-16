import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PacientesModule } from './pacientes/pacientes.module';
import { AtendimentosModule } from './atendimentos/atendimentos.module';
import { EvolucoesModule } from './evolucoes/evolucoes.module';
import { AnexosModule } from './anexos/anexos.module';
import { StorageModule } from './storage/storage.module';
import { RetentionModule } from './retention/retention.module';
import { ConditionsModule } from './conditions/conditions.module';
import { MedicationsModule } from './medications/medications.module';
import { AllergiesModule } from './allergies/allergies.module';
import { FontesPagadorasModule } from './fontes-pagadoras/fontes-pagadoras.module';
import { PlantoesModule } from './plantoes/plantoes.module';
import { PagamentosModule } from './pagamentos/pagamentos.module';
import { IRModule } from './ir/ir.module';
import { TenantContextInterceptor } from './shared/interceptors/tenant-context.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    PacientesModule,
    AtendimentosModule,
    EvolucoesModule,
    AnexosModule,
    StorageModule,
    RetentionModule,
    ConditionsModule,
    MedicationsModule,
    AllergiesModule,
    FontesPagadorasModule,
    PlantoesModule,
    PagamentosModule,
    IRModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantContextInterceptor,
    },
  ],
})
export class AppModule {}
