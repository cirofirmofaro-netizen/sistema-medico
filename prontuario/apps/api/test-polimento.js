// Script para testar o polimento completo
const crypto = require('crypto');

// Configuração
const BASE_URL = 'http://localhost:3000';
const DOCUMENTO_ID = 'test-doc-id';

// Função para gerar HMAC
function generateHmac(secret, body) {
  return crypto.createHmac('sha256', secret).update(body).digest('hex');
}

// Função para gerar UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Teste 1: Revalidação de certificado
async function testRevalidate() {
  console.log('🔍 Testando revalidação de certificado...');
  
  const response = await fetch(`${BASE_URL}/assinatura/${DOCUMENTO_ID}/revalidate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({})
  });
  
  if (response.ok) {
    const data = await response.json();
    console.log('✅ Revalidação OK:', data);
    return true;
  } else {
    console.log('❌ Revalidação FAILED:', response.status, await response.text());
    return false;
  }
}

// Teste 2: Export com anexos binários
async function testExportWithAttachments() {
  console.log('\n📦 Testando export com anexos binários...');
  
  const body = {
    pacienteId: "test-paciente-id",
    from: "2025-01-01",
    to: "2025-12-31",
    incluirAnexos: true
  };
  
  const response = await fetch(`${BASE_URL}/export/prontuario`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body)
  });
  
  if (response.ok) {
    const data = await response.json();
    console.log('✅ Export ZIP OK:', { tipo: data.tipo, url: data.url.substring(0, 50) + '...' });
    return true;
  } else {
    console.log('❌ Export ZIP FAILED:', response.status, await response.text());
    return false;
  }
}

// Teste 3: Geração de documento com polimento
async function testDocumentWithPolish() {
  console.log('\n🎨 Testando geração de documento com polimento...');
  
  const body = {
    pacienteId: "test-paciente-id",
    itens: [
      { medicamento: "Paracetamol", posologia: "1 comprimido 6/6h", quantidade: "20 comprimidos" }
    ],
    observacoes: "Teste de documento com polimento"
  };
  
  const response = await fetch(`${BASE_URL}/documentos/receita`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body)
  });
  
  if (response.ok) {
    const data = await response.json();
    console.log('✅ Documento com polimento OK:', { 
      id: data.id, 
      hashSha256: data.hashSha256?.substring(0, 16) + '...',
      assinaturaStatus: data.assinaturaStatus 
    });
    return true;
  } else {
    console.log('❌ Documento com polimento FAILED:', response.status, await response.text());
    return false;
  }
}

// Executar testes
async function runTests() {
  console.log('🧪 Iniciando testes de polimento...\n');
  
  const results = [];
  
  // Teste 1
  const revalidate = await testRevalidate();
  results.push(revalidate);
  
  // Teste 2
  const exportZip = await testExportWithAttachments();
  results.push(exportZip);
  
  // Teste 3
  const documentPolish = await testDocumentWithPolish();
  results.push(documentPolish);
  
  // Resultado final
  console.log('\n📊 Resultado dos testes:');
  console.log(`✅ Revalidação: ${results[0] ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Export ZIP: ${results[1] ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Documento polido: ${results[2] ? 'PASS' : 'FAIL'}`);
  
  const allPassed = results.every(r => r);
  console.log(`\n🎯 ${allPassed ? 'TODOS OS TESTES PASSARAM!' : 'ALGUNS TESTES FALHARAM'}`);
}

// Executar se chamado diretamente
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };
