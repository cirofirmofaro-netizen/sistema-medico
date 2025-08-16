const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testMiddleware() {
  try {
    console.log('🧪 TESTE DO MIDDLEWARE...\n');

    // 1. Teste SEM contexto (deve retornar tudo)
    console.log('1. Teste SEM contexto (deve retornar tudo):');
    const semContexto = await prisma.fontePagadora.findMany({
      select: { id: true, nome: true, usuarioId: true }
    });
    console.log(`✅ Retornou ${semContexto.length} fontes:`);
    semContexto.forEach(f => console.log(`   - ${f.nome} (${f.usuarioId})`));

    // 2. Teste COM contexto (deve retornar apenas do usuário)
    console.log('\n2. Teste COM contexto (deve retornar apenas do usuário):');
    
    // Simular contexto do João
    global.currentRequest = { usuarioId: 'cmecc5qbb0000vscgmifp0mbq' };
    
    const comContexto = await prisma.fontePagadora.findMany({
      select: { id: true, nome: true, usuarioId: true }
    });
    console.log(`✅ Retornou ${comContexto.length} fontes:`);
    comContexto.forEach(f => console.log(`   - ${f.nome} (${f.usuarioId})`));

    // 3. Verificar se o middleware foi aplicado
    console.log('\n3. VERIFICAÇÃO:');
    if (comContexto.length < semContexto.length) {
      console.log('✅ Middleware funcionando! Filtrou os dados.');
    } else {
      console.log('❌ Middleware NÃO funcionando! Retornou todos os dados.');
    }

    // 4. Teste com Maria
    console.log('\n4. Teste COM contexto da Maria:');
    global.currentRequest = { usuarioId: 'cmecc5qbh0001vscgq3jtx4qi' };
    
    const mariaContexto = await prisma.fontePagadora.findMany({
      select: { id: true, nome: true, usuarioId: true }
    });
    console.log(`✅ Retornou ${mariaContexto.length} fontes:`);
    mariaContexto.forEach(f => console.log(`   - ${f.nome} (${f.usuarioId})`));

    // 5. Limpar contexto
    global.currentRequest = null;

  } catch (error) {
    console.error('❌ ERRO:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testMiddleware();
