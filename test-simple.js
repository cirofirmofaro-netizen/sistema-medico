const axios = require('axios');

const API_BASE = 'http://localhost:3000';

async function testSimple() {
  try {
    console.log('🧪 Teste simples da API...\n');
    
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
    joaoFontes.data.forEach(f => console.log(`   - ${f.nome}`));
    
    // 4. Testar fontes pagadoras - Maria
    console.log('\n4. Fontes pagadoras - Maria...');
    const mariaFontes = await axios.get(`${API_BASE}/fontes-pagadoras`, {
      headers: { Authorization: `Bearer ${mariaResponse.data.access_token}` }
    });
    console.log(`✅ Maria tem ${mariaFontes.data.length} fontes:`);
    mariaFontes.data.forEach(f => console.log(`   - ${f.nome}`));
    
    // 5. Verificar isolamento
    console.log('\n🔍 VERIFICAÇÃO:');
    console.log(`João: ${joaoFontes.data.length} fontes`);
    console.log(`Maria: ${mariaFontes.data.length} fontes`);
    
    const joaoNomes = joaoFontes.data.map(f => f.nome);
    const mariaNomes = mariaFontes.data.map(f => f.nome);
    const comuns = joaoNomes.filter(nome => mariaNomes.includes(nome));
    
    if (comuns.length > 0) {
      console.log('❌ PROBLEMA: Fontes em comum:', comuns);
    } else {
      console.log('✅ Isolamento funcionando!');
    }
    
  } catch (error) {
    console.error('❌ ERRO:', error.response?.data || error.message);
  }
}

testSimple();
