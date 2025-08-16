const { PrismaClient } = require('@prisma/client');

// Simular o middleware
function createTenantMiddleware(prisma) {
  console.log('🔧 Registrando middleware de tenant...');
  return prisma.$use(async (params, next) => {
    const usuarioId = global.currentRequest?.usuarioId;
    
    console.log('🔍 Middleware - Model:', params.model, 'Action:', params.action, 'UsuarioId:', usuarioId);
    
    if (!usuarioId) {
      console.log('⚠️  No usuarioId found, skipping middleware');
      return next(params);
    }

    // Lista de modelos que precisam de isolamento
    const tenantModels = ['FontePagadora', 'Paciente', 'Plantao'];
    
    if (!params.model || !tenantModels.includes(params.model)) {
      console.log('   ⚠️  Model not in tenant list, skipping middleware');
      return next(params);
    }

    // Aplicar filtro para findMany
    if (params.action === 'findMany' && params.args?.where) {
      console.log('   🔍 Adding usuarioId filter to where:', usuarioId);
      params.args.where = { ...params.args.where, usuarioId };
    } else if (params.action === 'findMany') {
      console.log('   🔍 Adding usuarioId filter (no where):', usuarioId);
      params.args = { ...params.args, where: { usuarioId } };
    }

    console.log('✅ Middleware applied for', params.model, params.action);
    return next(params);
  });
}

async function testPrismaService() {
  try {
    console.log('🧪 TESTE DO PRISMASERVICE...\n');

    // 1. Criar PrismaClient sem middleware
    console.log('1. Teste SEM middleware:');
    const prismaSemMiddleware = new PrismaClient();
    
    const semMiddleware = await prismaSemMiddleware.fontePagadora.findMany({
      select: { id: true, nome: true, usuarioId: true }
    });
    console.log(`✅ Retornou ${semMiddleware.length} fontes (sem middleware)`);

    // 2. Criar PrismaClient COM middleware
    console.log('\n2. Teste COM middleware:');
    const prismaComMiddleware = new PrismaClient();
    createTenantMiddleware(prismaComMiddleware);
    
    // Teste sem contexto
    const semContexto = await prismaComMiddleware.fontePagadora.findMany({
      select: { id: true, nome: true, usuarioId: true }
    });
    console.log(`✅ Retornou ${semContexto.length} fontes (sem contexto)`);

    // Teste com contexto
    global.currentRequest = { usuarioId: 'cmecc5qbb0000vscgmifp0mbq' };
    const comContexto = await prismaComMiddleware.fontePagadora.findMany({
      select: { id: true, nome: true, usuarioId: true }
    });
    console.log(`✅ Retornou ${comContexto.length} fontes (com contexto)`);

    // 3. Verificar se funcionou
    console.log('\n3. VERIFICAÇÃO:');
    if (comContexto.length < semContexto.length) {
      console.log('✅ Middleware funcionando!');
      comContexto.forEach(f => console.log(`   - ${f.nome} (${f.usuarioId})`));
    } else {
      console.log('❌ Middleware NÃO funcionando!');
    }

    // Limpar
    global.currentRequest = null;
    await prismaSemMiddleware.$disconnect();
    await prismaComMiddleware.$disconnect();

  } catch (error) {
    console.error('❌ ERRO:', error);
  }
}

testPrismaService();
