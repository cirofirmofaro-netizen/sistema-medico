const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  console.log('🔍 Verificando banco de dados...\n');

  try {
    // 1. Verificar usuários
    console.log('1. Verificando usuários...');
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
      }
    });
    console.log(`✅ Encontrados ${usuarios.length} usuários:`);
    usuarios.forEach(u => console.log(`   - ${u.nome} (${u.email}) - ID: ${u.id}`));

    // 2. Verificar fontes pagadoras
    console.log('\n2. Verificando fontes pagadoras...');
    const fontes = await prisma.fontePagadora.findMany({
      select: {
        id: true,
        nome: true,
        cnpj: true,
        usuarioId: true,
      }
    });
    console.log(`✅ Encontradas ${fontes.length} fontes pagadoras:`);
    fontes.forEach(f => console.log(`   - ${f.nome} (${f.cnpj}) - UsuarioId: ${f.usuarioId}`));

    // 3. Verificar pacientes
    console.log('\n3. Verificando pacientes...');
    const pacientes = await prisma.paciente.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        usuarioId: true,
      }
    });
    console.log(`✅ Encontrados ${pacientes.length} pacientes:`);
    pacientes.forEach(p => console.log(`   - ${p.nome} (${p.email}) - UsuarioId: ${p.usuarioId}`));

    // 4. Verificar plantões
    console.log('\n4. Verificando plantões...');
    const plantoes = await prisma.plantao.findMany({
      select: {
        id: true,
        local: true,
        status: true,
        usuarioId: true,
      }
    });
    console.log(`✅ Encontrados ${plantoes.length} plantões:`);
    plantoes.forEach(p => console.log(`   - ${p.local} (${p.status}) - UsuarioId: ${p.usuarioId}`));

    // 5. Verificar isolamento
    console.log('\n🔍 VERIFICAÇÃO DE ISOLAMENTO:');
    
    const joao = usuarios.find(u => u.email === 'joao@exemplo.com');
    const maria = usuarios.find(u => u.email === 'maria@exemplo.com');
    
    if (joao && maria) {
      console.log(`João ID: ${joao.id}`);
      console.log(`Maria ID: ${maria.id}`);
      
      const joaoFontes = fontes.filter(f => f.usuarioId === joao.id);
      const mariaFontes = fontes.filter(f => f.usuarioId === maria.id);
      
      const joaoPacientes = pacientes.filter(p => p.usuarioId === joao.id);
      const mariaPacientes = pacientes.filter(p => p.usuarioId === maria.id);
      
      const joaoPlantoes = plantoes.filter(p => p.usuarioId === joao.id);
      const mariaPlantoes = plantoes.filter(p => p.usuarioId === maria.id);
      
      console.log(`\nJoão: ${joaoFontes.length} fontes, ${joaoPacientes.length} pacientes, ${joaoPlantoes.length} plantões`);
      console.log(`Maria: ${mariaFontes.length} fontes, ${mariaPacientes.length} pacientes, ${mariaPlantoes.length} plantões`);
      
      // Verificar se há sobreposição
      const joaoFontesNomes = joaoFontes.map(f => f.nome);
      const mariaFontesNomes = mariaFontes.map(f => f.nome);
      const fontesComuns = joaoFontesNomes.filter(nome => mariaFontesNomes.includes(nome));
      
      if (fontesComuns.length > 0) {
        console.log('\n❌ PROBLEMA: Fontes pagadoras em comum:', fontesComuns);
      } else {
        console.log('\n✅ Isolamento de fontes pagadoras: OK');
      }
      
      const joaoPacientesNomes = joaoPacientes.map(p => p.nome);
      const mariaPacientesNomes = mariaPacientes.map(p => p.nome);
      const pacientesComuns = joaoPacientesNomes.filter(nome => mariaPacientesNomes.includes(nome));
      
      if (pacientesComuns.length > 0) {
        console.log('\n❌ PROBLEMA: Pacientes em comum:', pacientesComuns);
      } else {
        console.log('\n✅ Isolamento de pacientes: OK');
      }
      
      console.log('\n🎯 RESULTADO FINAL:');
      if (fontesComuns.length === 0 && pacientesComuns.length === 0) {
        console.log('✅ O banco de dados está isolado corretamente!');
      } else {
        console.log('❌ Há problemas no isolamento do banco de dados!');
      }
    } else {
      console.log('❌ Usuários de teste não encontrados!');
    }

  } catch (error) {
    console.error('❌ ERRO:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
