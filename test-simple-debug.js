const axios = require('axios');

const API_BASE = 'http://localhost:3000';

async function testSimpleDebug() {
  try {
    console.log('🧪 TESTE SIMPLES PARA DEBUG...\n');
    
    // 1. Login com João
    console.log('1. Login com João...');
    const joaoResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'joao@exemplo.com',
      senha: '123456'
    });
    console.log('✅ João logado');
    
    // 2. Testar fontes pagadoras - João
    console.log('\n2. Fontes pagadoras - João...');
    const joaoFontes = await axios.get(`${API_BASE}/fontes-pagadoras`, {
      headers: { Authorization: `Bearer ${joaoResponse.data.access_token}` }
    });
    console.log(`✅ João tem ${joaoFontes.data.length} fontes:`);
    joaoFontes.data.forEach(f => console.log(`   - ${f.nome} (${f.usuarioId})`));
    
    // 3. Verificar se há dados de Maria
    const mariaData = joaoFontes.data.filter(f => f.usuarioId === 'cmecc5qbh0001vscgq3jtx4qi');
    if (mariaData.length > 0) {
      console.log('\n❌ PROBLEMA: João está vendo dados de Maria:', mariaData.map(f => f.nome));
    } else {
      console.log('\n✅ Isolamento funcionando para João');
    }
    
  } catch (error) {
    console.error('❌ ERRO:', error.response?.data || error.message);
  }
}

testSimpleDebug();
