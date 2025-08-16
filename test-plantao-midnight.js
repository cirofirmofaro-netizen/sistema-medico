const axios = require('axios');

const API_BASE = 'http://localhost:3000';

async function testPlantaoMidnight() {
  try {
    console.log('🧪 TESTE PLANTÃO ATRAVESSANDO MEIA-NOITE...\n');
    
    // 1. Login
    console.log('1. Login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'joao@exemplo.com',
      senha: '123456'
    });
    console.log('✅ Logado');
    
    const token = loginResponse.data.access_token;
    const headers = { Authorization: `Bearer ${token}` };
    
    // 2. Buscar fonte pagadora
    console.log('\n2. Buscando fonte pagadora...');
    const fontesResponse = await axios.get(`${API_BASE}/fontes-pagadoras`, { headers });
    const fontePagadora = fontesResponse.data[0];
    console.log(`✅ Fonte: ${fontePagadora.nome}`);
    
    // 3. Testar plantão que atravessa meia-noite (19:00 - 07:00)
    console.log('\n3. Testando plantão 19:00 - 07:00 (atravessa meia-noite)...');
    
    const plantaoData = {
      fontePagadoraId: fontePagadora.id,
      data: '2024-12-20', // Sexta-feira
      inicio: '2024-12-20T19:00:00.000Z',
      fim: '2024-12-21T07:00:00.000Z', // Dia seguinte
      local: 'UTI - Hospital Teste',
      cnpj: '12.345.678/0001-90',
      valorPrevisto: 500.00,
      tipoVinculo: 'AUTONOMO'
    };
    
    try {
      const createResponse = await axios.post(`${API_BASE}/plantoes`, plantaoData, { headers });
      console.log('✅ Plantão criado com sucesso!');
      console.log(`   ID: ${createResponse.data.id}`);
      console.log(`   Início: ${createResponse.data.inicio}`);
      console.log(`   Fim: ${createResponse.data.fim}`);
      console.log(`   Duração: ${Math.round((new Date(createResponse.data.fim) - new Date(createResponse.data.inicio)) / (1000 * 60 * 60))} horas`);
    } catch (error) {
      console.log('❌ Erro ao criar plantão:', error.response?.data?.message || error.message);
    }
    
    // 4. Testar plantão no mesmo dia (08:00 - 18:00)
    console.log('\n4. Testando plantão 08:00 - 18:00 (mesmo dia)...');
    
    const plantaoData2 = {
      fontePagadoraId: fontePagadora.id,
      data: '2024-12-21', // Sábado
      inicio: '2024-12-21T08:00:00.000Z',
      fim: '2024-12-21T18:00:00.000Z',
      local: 'Emergência - Hospital Teste',
      cnpj: '12.345.678/0001-90',
      valorPrevisto: 400.00,
      tipoVinculo: 'AUTONOMO'
    };
    
    try {
      const createResponse2 = await axios.post(`${API_BASE}/plantoes`, plantaoData2, { headers });
      console.log('✅ Plantão criado com sucesso!');
      console.log(`   ID: ${createResponse2.data.id}`);
      console.log(`   Início: ${createResponse2.data.inicio}`);
      console.log(`   Fim: ${createResponse2.data.fim}`);
      console.log(`   Duração: ${Math.round((new Date(createResponse2.data.fim) - new Date(createResponse2.data.inicio)) / (1000 * 60 * 60))} horas`);
    } catch (error) {
      console.log('❌ Erro ao criar plantão:', error.response?.data?.message || error.message);
    }
    
    // 5. Listar plantões criados
    console.log('\n5. Listando plantões...');
    const plantoesResponse = await axios.get(`${API_BASE}/plantoes`, { headers });
    console.log(`✅ Total de plantões: ${plantoesResponse.data.length}`);
    
    plantoesResponse.data.forEach((plantao, index) => {
      const inicio = new Date(plantao.inicio);
      const fim = new Date(plantao.fim);
      const duracao = Math.round((fim - inicio) / (1000 * 60 * 60));
      console.log(`   ${index + 1}. ${plantao.local} - ${inicio.toLocaleDateString()} ${inicio.toLocaleTimeString()} até ${fim.toLocaleTimeString()} (${duracao}h)`);
    });
    
  } catch (error) {
    console.error('❌ ERRO:', error.response?.data || error.message);
  }
}

testPlantaoMidnight();
