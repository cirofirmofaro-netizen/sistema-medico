import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { TenantContext } from '../shared/context/tenant-context';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super();
    
    // Aplicar middleware de tenant
    console.log('🔧 Aplicando middleware de tenant ao PrismaService...');
    this.applyTenantMiddleware();
    console.log('✅ Middleware de tenant aplicado com sucesso');
  }

  async onModuleInit() { 
    await this.$connect(); 
  }
  
  async onModuleDestroy() {
    await this.$disconnect();
  }

  private applyTenantMiddleware() {
    // Middleware de tenant
    this.$use(async (params, next) => {
      const userId = TenantContext.getUserId();
      console.log('[PRISMA][MW] before', { 
        model: params.model, 
        action: params.action, 
        userId,
        args: params.args
      });

      if (!userId) {
        console.log('[PRISMA][MW] No userId, skipping middleware');
        return next(params);
      }

      // Lista de modelos que precisam de isolamento
      const tenantModels = [
        'Paciente', 'Consulta', 'Episodio', 'Evolucao', 'SinaisVitais',
        'Anexo', 'Alergia', 'MedicacaoAtiva', 'ProblemaClinico', 'DocumentoClinico',
        'PatientCondition', 'PatientMedication', 'Atendimento', 'PatientAllergy',
        'FontePagadora', 'ModeloPlantao', 'Plantao', 'Pagamento', 'NotaFiscal', 'InformeRendimento'
      ];

      if (!params.model || !tenantModels.includes(params.model)) {
        console.log('[PRISMA][MW] Model not in tenant list, skipping');
        return next(params);
      }

      // Função para adicionar filtro usuarioId
      const scopeWhere = (w: any) => ({ ...(w ?? {}), usuarioId: userId });

      // Aplicar filtros baseado na ação
      switch (params.action) {
        case 'findUnique':
        case 'findFirst':
          params.args.where = scopeWhere(params.args?.where);
          break;

        case 'findMany':
        case 'count':
        case 'aggregate':
          params.args = params.args ?? {};
          params.args.where = scopeWhere(params.args.where);
          break;

        case 'create':
          params.args.data = { ...(params.args.data ?? {}), usuarioId: userId };
          break;

        case 'createMany':
          params.args.data = (params.args.data ?? []).map((d: any) => ({ ...d, usuarioId: userId }));
          break;

        case 'update':
        case 'delete':
          params.args.where = scopeWhere(params.args.where);
          break;

        case 'updateMany':
        case 'deleteMany':
          params.args.where = scopeWhere(params.args.where);
          break;

        case 'upsert':
          params.args.where = scopeWhere(params.args.where);
          params.args.create = { ...(params.args.create ?? {}), usuarioId: userId };
          break;

        default:
          break;
      }

      const result = await next(params);
      
      console.log('[PRISMA][MW] after', { 
        model: params.model, 
        action: params.action, 
        userId,
        resultCount: Array.isArray(result) ? result.length : 1
      });
      
      return result;
    });
  }
}
