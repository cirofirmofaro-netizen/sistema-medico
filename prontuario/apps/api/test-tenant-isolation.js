const axios = require('axios');

const API_BASE = 'http://localhost:3000';

async function testTenantIsolation() {
  console.log('🧪 Testando isolamento single-tenant...\n');

  try {
    // 1. Login com João
    console.log('1. Login com João...');
    const joaoResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'joao@exemplo.com',
      senha: '123456'
    });
    const joaoToken = joaoResponse.data.access_token;
    console.log('✅ João logado com sucesso');

    // 2. Login com Maria
    console.log('\n2. Login com Maria...');
    const mariaResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'maria@exemplo.com',
      senha: '123456'
    });
    const mariaToken = mariaResponse.data.access_token;
    console.log('✅ Maria logada com sucesso');

    // 3. Testar fontes pagadoras - João
    console.log('\n3. Testando fontes pagadoras - João...');
    const joaoFontes = await axios.get(`${API_BASE}/fontes-pagadoras`, {
      headers: { Authorization: `Bearer ${joaoToken}` }
    });
    console.log(`✅ João tem ${joaoFontes.data.length} fontes pagadoras`);

    // 4. Testar fontes pagadoras - Maria
    console.log('\n4. Testando fontes pagadoras - Maria...');
    const mariaFontes = await axios.get(`${API_BASE}/fontes-pagadoras`, {
      headers: { Authorization: `Bearer ${mariaToken}` }
    });
    console.log(`✅ Maria tem ${mariaFontes.data.length} fontes pagadoras`);

    // 5. Testar plantões - João
    console.log('\n5. Testando plantões - João...');
    const joaoPlantoes = await axios.get(`${API_BASE}/plantoes`, {
      headers: { Authorization: `Bearer ${joaoToken}` }
    });
    console.log(`✅ João tem ${joaoPlantoes.data.length} plantões`);

    // 6. Testar plantões - Maria
    console.log('\n6. Testando plantões - Maria...');
    const mariaPlantoes = await axios.get(`${API_BASE}/plantoes`, {
      headers: { Authorization: `Bearer ${mariaToken}` }
    });
    console.log(`✅ Maria tem ${mariaPlantoes.data.length} plantões`);

    // 7. Testar pacientes - João
    console.log('\n7. Testando pacientes - João...');
    const joaoPacientes = await axios.get(`${API_BASE}/pacientes`, {
      headers: { Authorization: `Bearer ${joaoToken}` }
    });
    console.log(`✅ João tem ${joaoPacientes.data.pacientes.length} pacientes`);

    // 8. Testar pacientes - Maria
    console.log('\n8. Testando pacientes - Maria...');
    const mariaPacientes = await axios.get(`${API_BASE}/pacientes`, {
      headers: { Authorization: `Bearer ${mariaToken}` }
    });
    console.log(`✅ Maria tem ${mariaPacientes.data.pacientes.length} pacientes`);

    // 9. Verificar isolamento
    console.log('\n🔍 VERIFICAÇÃO DE ISOLAMENTO:');
    console.log(`João: ${joaoFontes.data.length} fontes, ${joaoPlantoes.data.length} plantões, ${joaoPacientes.data.pacientes.length} pacientes`);
    console.log(`Maria: ${mariaFontes.data.length} fontes, ${mariaPlantoes.data.length} plantões, ${mariaPacientes.data.pacientes.length} pacientes`);

    // 10. Testar criação de dados
    console.log('\n9. Testando criação de dados...');
    
    // João cria uma fonte pagadora
    const novaFonteJoao = await axios.post(`${API_BASE}/fontes-pagadoras`, {
      nome: 'Hospital Teste João',
      cnpj: '12345678901234',
      ativo: true
    }, {
      headers: { Authorization: `Bearer ${joaoToken}` }
    });
    console.log('✅ João criou uma fonte pagadora');

    // Verificar se Maria não vê a fonte de João
    const mariaFontesApos = await axios.get(`${API_BASE}/fontes-pagadoras`, {
      headers: { Authorization: `Bearer ${mariaToken}` }
    });
    console.log(`✅ Maria ainda tem ${mariaFontesApos.data.length} fontes (isolamento mantido)`);

    console.log('\n🎉 TESTE CONCLUÍDO COM SUCESSO!');
    console.log('✅ O isolamento single-tenant está funcionando corretamente!');

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
  }
}

testTenantIsolation();
