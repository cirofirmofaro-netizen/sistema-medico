const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabaseSQL() {
  try {
    console.log('🔍 VERIFICAÇÃO SQL DIRETA DO BANCO...\n');

    // 1. Verificar usuários
    console.log('1. USUÁRIOS:');
    const usuarios = await prisma.$queryRaw`
      SELECT id, nome, email FROM "Usuario" ORDER BY nome
    `;
    console.log(usuarios);

    // 2. Verificar pacientes por usuario_id
    console.log('\n2. PACIENTES POR USUARIO_ID:');
    const pacientesCount = await prisma.$queryRaw`
      SELECT "usuarioId", COUNT(*) as total 
      FROM "Paciente" 
      GROUP BY "usuarioId"
    `;
    console.log(pacientesCount);

    // 3. Verificar plantões por usuario_id
    console.log('\n3. PLANTÕES POR USUARIO_ID:');
    const plantoesCount = await prisma.$queryRaw`
      SELECT "usuarioId", COUNT(*) as total 
      FROM "Plantao" 
      GROUP BY "usuarioId"
    `;
    console.log(plantoesCount);

    // 4. Verificar fontes pagadoras por usuario_id
    console.log('\n4. FONTES PAGADORAS POR USUARIO_ID:');
    const fontesCount = await prisma.$queryRaw`
      SELECT "usuarioId", COUNT(*) as total 
      FROM "FontePagadora" 
      GROUP BY "usuarioId"
    `;
    console.log(fontesCount);

    // 5. Verificar se há NULLs
    console.log('\n5. VERIFICANDO NULLs:');
    const nulls = await prisma.$queryRaw`
      SELECT 
        'Paciente' as tabela, COUNT(*) as total_nulls
      FROM "Paciente" 
      WHERE "usuarioId" IS NULL
      UNION ALL
      SELECT 
        'Plantao' as tabela, COUNT(*) as total_nulls
      FROM "Plantao" 
      WHERE "usuarioId" IS NULL
      UNION ALL
      SELECT 
        'FontePagadora' as tabela, COUNT(*) as total_nulls
      FROM "FontePagadora" 
      WHERE "usuarioId" IS NULL
    `;
    console.log(nulls);

    // 6. Verificar estrutura das tabelas
    console.log('\n6. ESTRUTURA DAS TABELAS:');
    const estrutura = await prisma.$queryRaw`
      SELECT 
        column_name, 
        is_nullable, 
        data_type,
        table_name
      FROM information_schema.columns 
      WHERE table_name IN ('Paciente', 'Plantao', 'FontePagadora')
      AND column_name = 'usuarioId'
      ORDER BY table_name
    `;
    console.log(estrutura);

    // 7. Verificar índices
    console.log('\n7. ÍNDICES:');
    const indices = await prisma.$queryRaw`
      SELECT 
        indexname, 
        tablename, 
        indexdef
      FROM pg_indexes 
      WHERE tablename IN ('Paciente', 'Plantao', 'FontePagadora')
      AND indexdef LIKE '%usuarioId%'
    `;
    console.log(indices);

    // 8. Verificar RLS
    console.log('\n8. ROW LEVEL SECURITY:');
    const rls = await prisma.$queryRaw`
      SELECT 
        relname, 
        relrowsecurity
      FROM pg_class 
      WHERE relname IN ('Paciente', 'Plantao', 'FontePagadora')
    `;
    console.log(rls);

  } catch (error) {
    console.error('❌ ERRO:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseSQL();
