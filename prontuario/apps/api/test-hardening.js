// Script para testar o hardening completo
const crypto = require('crypto');

// Configuração
const SECRET = 'teste123';
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

// Teste 1: Request (sem HMAC necessário)
async function testRequest() {
  console.log('🔍 Testando REQUEST...');
  
  const response = await fetch(`${BASE_URL}/assinatura/${DOCUMENTO_ID}/request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({})
  });
  
  if (response.ok) {
    const data = await response.json();
    console.log('✅ REQUEST OK:', { hashAlgo: data.hashAlgo, hashHex: data.hashHex.substring(0, 16) + '...' });
    return data;
  } else {
    console.log('❌ REQUEST FAILED:', response.status, await response.text());
    return null;
  }
}

// Teste 2: Callback com HMAC válido
async function testCallbackValid(data) {
  console.log('\n🔐 Testando CALLBACK com HMAC válido...');
  
  const body = {
    formato: 'CMS',
    assinaturaBase64: Buffer.from('assinatura-teste').toString('base64'),
    signerName: 'Dr. Teste',
    algoritimo: 'RSA-SHA256'
  };
  
  const bodyStr = JSON.stringify(body);
  const signature = generateHmac(SECRET, bodyStr);
  const idemKey = generateUUID();
  
  const response = await fetch(`${BASE_URL}/assinatura/${DOCUMENTO_ID}/callback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Signature': signature,
      'Idempotency-Key': idemKey
    },
    body: bodyStr
  });
  
  if (response.ok) {
    const result = await response.json();
    console.log('✅ CALLBACK OK:', result);
    return true;
  } else {
    console.log('❌ CALLBACK FAILED:', response.status, await response.text());
    return false;
  }
}

// Teste 3: Callback com HMAC inválido
async function testCallbackInvalid() {
  console.log('\n🚫 Testando CALLBACK com HMAC inválido...');
  
  const body = {
    formato: 'CMS',
    assinaturaBase64: Buffer.from('assinatura-teste').toString('base64'),
    signerName: 'Dr. Teste'
  };
  
  const bodyStr = JSON.stringify(body);
  const signature = 'assinatura-invalida';
  const idemKey = generateUUID();
  
  const response = await fetch(`${BASE_URL}/assinatura/${DOCUMENTO_ID}/callback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Signature': signature,
      'Idempotency-Key': idemKey
    },
    body: bodyStr
  });
  
  if (response.status === 401) {
    console.log('✅ CALLBACK HMAC inválido rejeitado corretamente');
    return true;
  } else {
    console.log('❌ CALLBACK HMAC inválido não foi rejeitado:', response.status);
    return false;
  }
}

// Teste 4: Callback duplicado (idempotência)
async function testCallbackDuplicate() {
  console.log('\n🔄 Testando CALLBACK duplicado (idempotência)...');
  
  const body = {
    formato: 'CMS',
    assinaturaBase64: Buffer.from('assinatura-teste').toString('base64'),
    signerName: 'Dr. Teste'
  };
  
  const bodyStr = JSON.stringify(body);
  const signature = generateHmac(SECRET, bodyStr);
  const idemKey = generateUUID(); // Mesmo ID para testar duplicação
  
  // Primeira chamada
  const response1 = await fetch(`${BASE_URL}/assinatura/${DOCUMENTO_ID}/callback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Signature': signature,
      'Idempotency-Key': idemKey
    },
    body: bodyStr
  });
  
  // Segunda chamada com mesmo ID
  const response2 = await fetch(`${BASE_URL}/assinatura/${DOCUMENTO_ID}/callback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Signature': signature,
      'Idempotency-Key': idemKey
    },
    body: bodyStr
  });
  
  if (response1.ok && response2.status === 409) {
    console.log('✅ Idempotência funcionando: primeira OK, segunda rejeitada');
    return true;
  } else {
    console.log('❌ Idempotência falhou:', response1.status, response2.status);
    return false;
  }
}

// Executar testes
async function runTests() {
  console.log('🧪 Iniciando testes de hardening...\n');
  
  // Configurar variável de ambiente
  process.env.SIGN_WEBHOOK_SECRET = SECRET;
  
  const results = [];
  
  // Teste 1
  const requestData = await testRequest();
  results.push(!!requestData);
  
  // Teste 2
  if (requestData) {
    const callbackValid = await testCallbackValid(requestData);
    results.push(callbackValid);
  }
  
  // Teste 3
  const callbackInvalid = await testCallbackInvalid();
  results.push(callbackInvalid);
  
  // Teste 4
  const callbackDuplicate = await testCallbackDuplicate();
  results.push(callbackDuplicate);
  
  // Resultado final
  console.log('\n📊 Resultado dos testes:');
  console.log(`✅ Request: ${results[0] ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Callback HMAC válido: ${results[1] ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Callback HMAC inválido: ${results[2] ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Idempotência: ${results[3] ? 'PASS' : 'FAIL'}`);
  
  const allPassed = results.every(r => r);
  console.log(`\n🎯 ${allPassed ? 'TODOS OS TESTES PASSARAM!' : 'ALGUNS TESTES FALHARAM'}`);
}

// Executar se chamado diretamente
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };
