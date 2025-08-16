const axios = require('axios');

const API_BASE = 'http://localhost:3000';

async function testAPIFinal() {
  try {
    console.log('🧪 TESTE FINAL DA API COM MIDDLEWARE...\n');
    
    // 1. Login com João
    console.log('1. Login com João...');
    const joaoResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'joao@exemplo.com',
      senha: '123456'
    });
    console.log('✅ João logado - Token:', joaoResponse.data.access_token.substring(0, 50) + '...');
    
    // 2. Login com Maria
    console.log('\n2. Login com Maria...');
    const mariaResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'maria@exemplo.com',
      senha: '123456'
    });
    console.log('✅ Maria logada - Token:', mariaResponse.data.access_token.substring(0, 50) + '...');
    
    // 3. Testar fontes pagadoras - João
    console.log('\n3. Fontes pagadoras - João...');
    const joaoFontes = await axios.get(`${API_BASE}/fontes-pagadoras`, {
      headers: { Authorization: `Bearer ${joaoResponse.data.access_token}` }
    });
    console.log(`✅ João tem ${joaoFontes.data.length} fontes:`);
    joaoFontes.data.forEach(f => console.log(`   - ${f.nome} (${f.usuarioId})`));
    
    // 4. Testar fontes pagadoras - Maria
    console.log('\n4. Fontes pagadoras - Maria...');
    const mariaFontes = await axios.get(`${API_BASE}/fontes-pagadoras`, {
      headers: { Authorization: `Bearer ${mariaResponse.data.access_token}` }
    });
    console.log(`✅ Maria tem ${mariaFontes.data.length} fontes:`);
    mariaFontes.data.forEach(f => console.log(`   - ${f.nome} (${f.usuarioId})`));
    
    // 5. Testar pacientes - João
    console.log('\n5. Pacientes - João...');
    const joaoPacientes = await axios.get(`${API_BASE}/pacientes`, {
      headers: { Authorization: `Bearer ${joaoResponse.data.access_token}` }
    });
    console.log(`✅ João tem ${joaoPacientes.data.length} pacientes:`);
    joaoPacientes.data.forEach(p => console.log(`   - ${p.nome} (${p.usuarioId})`));
    
    // 6. Testar pacientes - Maria
    console.log('\n6. Pacientes - Maria...');
    const mariaPacientes = await axios.get(`${API_BASE}/pacientes`, {
      headers: { Authorization: `Bearer ${mariaResponse.data.access_token}` }
    });
    console.log(`✅ Maria tem ${mariaPacientes.data.length} pacientes:`);
    mariaPacientes.data.forEach(p => console.log(`   - ${p.nome} (${p.usuarioId})`));
    
    // 7. Verificar isolamento
    console.log('\n🔍 VERIFICAÇÃO FINAL:');
    console.log(`João: ${joaoFontes.data.length} fontes, ${joaoPacientes.data.length} pacientes`);
    console.log(`Maria: ${mariaFontes.data.length} fontes, ${mariaPacientes.data.length} pacientes`);
    
    const joaoFontesNomes = joaoFontes.data.map(f => f.nome);
    const mariaFontesNomes = mariaFontes.data.map(f => f.nome);
    const fontesComuns = joaoFontesNomes.filter(nome => mariaFontesNomes.includes(nome));
    
    const joaoPacientesNomes = joaoPacientes.data.map(p => p.nome);
    const mariaPacientesNomes = mariaPacientes.data.map(p => p.nome);
    const pacientesComuns = joaoPacientesNomes.filter(nome => mariaPacientesNomes.includes(nome));
    
    if (fontesComuns.length > 0) {
      console.log('❌ PROBLEMA: Fontes em comum:', fontesComuns);
    } else {
      console.log('✅ Isolamento de fontes: OK');
    }
    
    if (pacientesComuns.length > 0) {
      console.log('❌ PROBLEMA: Pacientes em comum:', pacientesComuns);
    } else {
      console.log('✅ Isolamento de pacientes: OK');
    }
    
    console.log('\n🎯 RESULTADO:');
    if (fontesComuns.length === 0 && pacientesComuns.length === 0) {
      console.log('✅ ISOLAMENTO SINGLE-TENANT FUNCIONANDO!');
    } else {
      console.log('❌ Ainda há problemas no isolamento!');
    }
    
  } catch (error) {
    console.error('❌ ERRO:', error.response?.data || error.message);
  }
}

testAPIFinal();
