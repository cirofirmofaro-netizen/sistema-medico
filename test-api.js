const axios = require('axios');

async function testAPI() {
  try {
    console.log('🧪 Testando API...');
    
    // Teste básico de health check
    const health = await axios.get('http://localhost:3000');
    console.log('✅ Health check:', health.data);
    
    // Teste de login
    const login = await axios.post('http://localhost:3000/auth/login', {
      email: 'joao@exemplo.com',
      senha: '123456'
    });
    console.log('✅ Login bem-sucedido');
    
    const token = login.data.access_token;
    
    // Teste de fontes pagadoras
    const fontes = await axios.get('http://localhost:3000/fontes-pagadoras', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Fontes pagadoras:', fontes.data.length, 'itens');
    
    console.log('🎉 API está funcionando!');
    
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
  }
}

testAPI();
