#!/bin/bash

# Script de teste para o sistema de storage
# Uso: ./test-storage.sh [JWT_TOKEN]

set -e

API_URL="http://127.0.0.1:3000"
JWT_TOKEN=${1:-"SEU_TOKEN_JWT_AQUI"}

echo "🧪 Testando Sistema de Storage"
echo "================================"

# Verificar se a API está rodando
echo "1. Verificando se a API está rodando..."
if ! curl -s "$API_URL/health" > /dev/null 2>&1; then
    echo "❌ API não está rodando em $API_URL"
    echo "   Execute: cd apps/api && npm run start:dev"
    exit 1
fi
echo "✅ API está rodando"

# Verificar se MinIO está rodando
echo "2. Verificando se MinIO está rodando..."
if ! curl -s "http://127.0.0.1:9000/minio/health/live" > /dev/null 2>&1; then
    echo "❌ MinIO não está rodando"
    echo "   Execute: docker-compose up -d minio"
    exit 1
fi
echo "✅ MinIO está rodando"

# Teste 1: Gerar URL de upload
echo "3. Testando geração de URL de upload..."
UPLOAD_RESPONSE=$(curl -s -X POST "$API_URL/anexos/presign" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "filename": "teste.txt",
    "contentType": "text/plain",
    "size": 1024
  }')

if echo "$UPLOAD_RESPONSE" | grep -q "url"; then
    echo "✅ URL de upload gerada com sucesso"
    UPLOAD_URL=$(echo "$UPLOAD_RESPONSE" | grep -o '"url":"[^"]*"' | cut -d'"' -f4)
    STORAGE_KEY=$(echo "$UPLOAD_RESPONSE" | grep -o '"key":"[^"]*"' | cut -d'"' -f4)
    echo "   URL: ${UPLOAD_URL:0:50}..."
    echo "   Key: $STORAGE_KEY"
else
    echo "❌ Falha ao gerar URL de upload"
    echo "   Response: $UPLOAD_RESPONSE"
    exit 1
fi

# Teste 2: Fazer upload
echo "4. Testando upload de arquivo..."
echo "Conteúdo de teste $(date)" > teste.txt

UPLOAD_RESULT=$(curl -s -w "%{http_code}" -X PUT "$UPLOAD_URL" \
  -H "Content-Type: text/plain" \
  --data-binary @teste.txt)

HTTP_CODE="${UPLOAD_RESULT: -3}"
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Upload realizado com sucesso"
else
    echo "❌ Falha no upload (HTTP $HTTP_CODE)"
    echo "   Response: ${UPLOAD_RESULT%???}"
    exit 1
fi

# Teste 3: Gerar URL de download
echo "5. Testando geração de URL de download..."
DOWNLOAD_RESPONSE=$(curl -s -X GET "$API_URL/anexos/presign?key=$STORAGE_KEY" \
  -H "Authorization: Bearer $JWT_TOKEN")

if echo "$DOWNLOAD_RESPONSE" | grep -q "url"; then
    echo "✅ URL de download gerada com sucesso"
    DOWNLOAD_URL=$(echo "$DOWNLOAD_RESPONSE" | grep -o '"url":"[^"]*"' | cut -d'"' -f4)
    echo "   URL: ${DOWNLOAD_URL:0:50}..."
else
    echo "❌ Falha ao gerar URL de download"
    echo "   Response: $DOWNLOAD_RESPONSE"
    exit 1
fi

# Teste 4: Fazer download
echo "6. Testando download de arquivo..."
DOWNLOAD_CONTENT=$(curl -s "$DOWNLOAD_URL")
if echo "$DOWNLOAD_CONTENT" | grep -q "Conteúdo de teste"; then
    echo "✅ Download realizado com sucesso"
    echo "   Conteúdo: ${DOWNLOAD_CONTENT:0:30}..."
else
    echo "❌ Falha no download"
    echo "   Conteúdo recebido: $DOWNLOAD_CONTENT"
    exit 1
fi

# Teste 5: Deletar arquivo
echo "7. Testando deleção de arquivo..."
DELETE_RESPONSE=$(curl -s -X DELETE "$API_URL/anexos/$STORAGE_KEY" \
  -H "Authorization: Bearer $JWT_TOKEN")

if echo "$DELETE_RESPONSE" | grep -q "success"; then
    echo "✅ Arquivo deletado com sucesso"
else
    echo "❌ Falha ao deletar arquivo"
    echo "   Response: $DELETE_RESPONSE"
    exit 1
fi

# Limpeza
echo "8. Limpando arquivos de teste..."
rm -f teste.txt

echo ""
echo "🎉 Todos os testes passaram!"
echo "================================"
echo "✅ API funcionando"
echo "✅ MinIO funcionando"
echo "✅ Upload funcionando"
echo "✅ Download funcionando"
echo "✅ Deleção funcionando"
echo ""
echo "🚀 Sistema de storage está pronto para uso!"
