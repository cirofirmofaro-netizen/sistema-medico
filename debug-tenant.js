const axios = require('axios');

const API_BASE = 'http://localhost:3000';

async function debugTenantIsolation() {
  console.log('🔍 DEBUG: Verificando isolamento single-tenant...\n');

  try {
    // 1. Login com João
    console.log('1. Login com João...');
    const joaoResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'joao@exemplo.com',
      senha: '123456'
    });
    const joaoToken = joaoResponse.data.access_token;
    const joaoUser = joaoResponse.data.user;
    console.log('✅ João logado - ID:', joaoUser.id);
    console.log('   Token:', joaoToken.substring(0, 50) + '...');

    // 2. Login com Maria
    console.log('\n2. Login com Maria...');
    const mariaResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'maria@exemplo.com',
      senha: '123456'
    });
    const mariaToken = mariaResponse.data.access_token;
    const mariaUser = mariaResponse.data.user;
    console.log('✅ Maria logada - ID:', mariaUser.id);
    console.log('   Token:', mariaToken.substring(0, 50) + '...');

    // 3. Verificar se os IDs são diferentes
    console.log('\n3. Verificando IDs dos usuários...');
    if (joaoUser.id === mariaUser.id) {
      console.log('❌ ERRO: Os usuários têm o mesmo ID!');
      return;
    } else {
      console.log('✅ IDs diferentes:', joaoUser.id, 'vs', mariaUser.id);
    }

    // 4. Testar fontes pagadoras - João
    console.log('\n4. Testando fontes pagadoras - João...');
    const joaoFontes = await axios.get(`${API_BASE}/fontes-pagadoras`, {
      headers: { Authorization: `Bearer ${joaoToken}` }
    });
    console.log(`✅ João tem ${joaoFontes.data.length} fontes pagadoras:`);
    joaoFontes.data.forEach(fonte => {
      console.log(`   - ${fonte.nome} (CNPJ: ${fonte.cnpj})`);
    });

    // 5. Testar fontes pagadoras - Maria
    console.log('\n5. Testando fontes pagadoras - Maria...');
    const mariaFontes = await axios.get(`${API_BASE}/fontes-pagadoras`, {
      headers: { Authorization: `Bearer ${mariaToken}` }
    });
    console.log(`✅ Maria tem ${mariaFontes.data.length} fontes pagadoras:`);
    mariaFontes.data.forEach(fonte => {
      console.log(`   - ${fonte.nome} (CNPJ: ${fonte.cnpj})`);
    });

    // 6. Testar plantões - João
    console.log('\n6. Testando plantões - João...');
    const joaoPlantoes = await axios.get(`${API_BASE}/plantoes`, {
      headers: { Authorization: `Bearer ${joaoToken}` }
    });
    console.log(`✅ João tem ${joaoPlantoes.data.length} plantões:`);
    joaoPlantoes.data.forEach(plantao => {
      console.log(`   - ${plantao.local} (${plantao.status})`);
    });

    // 7. Testar plantões - Maria
    console.log('\n7. Testando plantões - Maria...');
    const mariaPlantoes = await axios.get(`${API_BASE}/plantoes`, {
      headers: { Authorization: `Bearer ${mariaToken}` }
    });
    console.log(`✅ Maria tem ${mariaPlantoes.data.length} plantões:`);
    mariaPlantoes.data.forEach(plantao => {
      console.log(`   - ${plantao.local} (${plantao.status})`);
    });

    // 8. Testar pacientes - João
    console.log('\n8. Testando pacientes - João...');
    const joaoPacientes = await axios.get(`${API_BASE}/pacientes`, {
      headers: { Authorization: `Bearer ${joaoToken}` }
    });
    console.log(`✅ João tem ${joaoPacientes.data.pacientes.length} pacientes:`);
    joaoPacientes.data.pacientes.forEach(paciente => {
      console.log(`   - ${paciente.nome} (${paciente.email})`);
    });

    // 9. Testar pacientes - Maria
    console.log('\n9. Testando pacientes - Maria...');
    const mariaPacientes = await axios.get(`${API_BASE}/pacientes`, {
      headers: { Authorization: `Bearer ${mariaToken}` }
    });
    console.log(`✅ Maria tem ${mariaPacientes.data.pacientes.length} pacientes:`);
    mariaPacientes.data.pacientes.forEach(paciente => {
      console.log(`   - ${paciente.nome} (${paciente.email})`);
    });

    // 10. Verificar isolamento
    console.log('\n🔍 VERIFICAÇÃO DE ISOLAMENTO:');
    console.log(`João: ${joaoFontes.data.length} fontes, ${joaoPlantoes.data.length} plantões, ${joaoPacientes.data.pacientes.length} pacientes`);
    console.log(`Maria: ${mariaFontes.data.length} fontes, ${mariaPlantoes.data.length} plantões, ${mariaPacientes.data.pacientes.length} pacientes`);

    // 11. Verificar se há sobreposição de dados
    const joaoFontesNomes = joaoFontes.data.map(f => f.nome);
    const mariaFontesNomes = mariaFontes.data.map(f => f.nome);
    const fontesComuns = joaoFontesNomes.filter(nome => mariaFontesNomes.includes(nome));

    if (fontesComuns.length > 0) {
      console.log('\n❌ PROBLEMA: Fontes pagadoras em comum:', fontesComuns);
    } else {
      console.log('\n✅ Isolamento de fontes pagadoras: OK');
    }

    const joaoPacientesNomes = joaoPacientes.data.pacientes.map(p => p.nome);
    const mariaPacientesNomes = mariaPacientes.data.pacientes.map(p => p.nome);
    const pacientesComuns = joaoPacientesNomes.filter(nome => mariaPacientesNomes.includes(nome));

    if (pacientesComuns.length > 0) {
      console.log('\n❌ PROBLEMA: Pacientes em comum:', pacientesComuns);
    } else {
      console.log('\n✅ Isolamento de pacientes: OK');
    }

    console.log('\n🎯 RESULTADO FINAL:');
    if (fontesComuns.length === 0 && pacientesComuns.length === 0) {
      console.log('✅ O isolamento single-tenant está funcionando corretamente!');
    } else {
      console.log('❌ Há problemas no isolamento single-tenant!');
    }

  } catch (error) {
    console.error('\n❌ ERRO NO DEBUG:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
  }
}

debugTenantIsolation();
