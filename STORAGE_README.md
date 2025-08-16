# Sistema de Storage de Anexos

Este sistema implementa armazenamento de arquivos usando S3-compatible storage (MinIO para desenvolvimento, AWS S3 para produção) com URLs assinadas para upload e download direto.

## 🚀 Início Rápido

### 1. Subir MinIO (Desenvolvimento)

```bash
# Na raiz do projeto
docker-compose up -d minio
```

### 2. Configurar Ambiente

Copie o arquivo de exemplo e configure as variáveis:

```bash
# Na pasta apps/api
cp env.development .env
```

### 3. Criar Bucket no MinIO

1. Acesse o console MinIO: http://127.0.0.1:9001
2. Login: `minio` / `minio123`
3. Crie o bucket: `medibuddy-anexos`
4. Configure CORS (veja seção CORS abaixo)

### 4. Testar Upload

```bash
# Gerar URL de upload
curl -X POST http://127.0.0.1:3000/anexos/presign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -d '{"filename":"exame.pdf","contentType":"application/pdf"}'

# Fazer upload do arquivo
curl -X PUT "<URL_ASSINADA>" \
  -H "Content-Type: application/pdf" \
  --data-binary @exame.pdf
```

## 📁 Estrutura de Arquivos

```
prontuario/
├── docker-compose.yml              # MinIO + PostgreSQL
├── apps/api/
│   ├── src/
│   │   ├── config/env.ts           # Validação de variáveis
│   │   ├── storage/
│   │   │   ├── s3.client.ts        # Cliente S3 configurável
│   │   │   ├── storage.service.ts  # Serviço de storage
│   │   │   └── storage.module.ts   # Módulo NestJS
│   │   ├── anexos/
│   │   │   ├── anexos.controller.ts # Endpoints REST
│   │   │   └── anexos.module.ts    # Módulo de anexos
│   │   └── shared/slug.ts          # Utilitários
│   └── env.development             # Configurações dev
└── apps/web/src/lib/upload.ts      # Exemplo frontend
```

## 🔧 Configuração

### Variáveis de Ambiente

```bash
# Storage Configuration
STORAGE_PROVIDER=S3
AWS_ACCESS_KEY_ID=minio                    # minio para dev, sua_key para prod
AWS_SECRET_ACCESS_KEY=minio123             # minio123 para dev, sua_secret para prod
AWS_REGION=us-east-1
S3_ENDPOINT=http://127.0.0.1:9000         # Apenas para MinIO/R2/B2
S3_BUCKET=medibuddy-anexos
S3_FORCE_PATH_STYLE=true                  # true para MinIO/R2/B2
PRESIGN_EXPIRES_SECONDS=300
```

### CORS no MinIO

No console MinIO (http://127.0.0.1:9001), vá em:
1. Buckets → `medibuddy-anexos` → Manage
2. CORS → Add CORS Rule

```json
[
  {
    "AllowedOrigin": ["http://localhost:5173", "http://localhost:3000"],
    "AllowedMethod": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeader": ["*"],
    "ExposeHeader": ["ETag", "x-amz-request-id"],
    "MaxAgeSeconds": 3000
  }
]
```

## 📡 Endpoints da API

### POST /anexos/presign
Gera URL assinada para upload.

**Request:**
```json
{
  "filename": "exame.pdf",
  "contentType": "application/pdf",
  "size": 1024000
}
```

**Response:**
```json
{
  "url": "https://minio:9000/bucket/...",
  "key": "anexos/2025/08/14/uuid-exame.pdf",
  "expires": 300
}
```

### GET /anexos/presign?key=...
Gera URL assinada para download.

**Response:**
```json
{
  "url": "https://minio:9000/bucket/...",
  "expires": 300
}
```

### DELETE /anexos/:key
Remove arquivo do storage.

**Response:**
```json
{
  "success": true
}
```

## 🔄 Padrão de Chaves

Os arquivos são organizados seguindo o padrão:
```
anexos/{yyyy}/{MM}/{dd}/{uuid}-{slug(originalName)}
```

Exemplo:
```
anexos/2025/08/14/550e8400-e29b-41d4-a716-446655440000-exame.pdf
```

## 📱 Uso no Frontend

```typescript
import { uploadAnexo, getDownloadUrl, deleteAnexo } from '@/lib/upload';

// Upload com progresso
const result = await uploadAnexo(file, (progress) => {
  console.log(`Upload: ${progress.percentage}%`);
});

if (result.success) {
  console.log('Arquivo salvo com chave:', result.key);
} else {
  console.error('Erro:', result.error);
}

// Download
const downloadUrl = await getDownloadUrl(key);
window.open(downloadUrl);

// Deletar
const deleted = await deleteAnexo(key);
```

## 🚀 Migração para Produção

### AWS S3
```bash
STORAGE_PROVIDER=S3
AWS_ACCESS_KEY_ID=sua_access_key
AWS_SECRET_ACCESS_KEY=sua_secret_key
AWS_REGION=us-east-1
S3_BUCKET=medibuddy-anexos-prod
# Remover S3_ENDPOINT e S3_FORCE_PATH_STYLE
```

### Cloudflare R2
```bash
STORAGE_PROVIDER=S3
AWS_ACCESS_KEY_ID=sua_r2_access_key
AWS_SECRET_ACCESS_KEY=sua_r2_secret_key
AWS_REGION=auto
S3_ENDPOINT=https://account_id.r2.cloudflarestorage.com
S3_BUCKET=medibuddy-anexos
S3_FORCE_PATH_STYLE=true
```

### Backblaze B2
```bash
STORAGE_PROVIDER=S3
AWS_ACCESS_KEY_ID=sua_b2_key_id
AWS_SECRET_ACCESS_KEY=sua_b2_application_key
AWS_REGION=us-west-002
S3_ENDPOINT=https://s3.us-west-002.backblazeb2.com
S3_BUCKET=medibuddy-anexos
S3_FORCE_PATH_STYLE=true
```

## 🔒 Segurança

- ✅ URLs assinadas com expiração
- ✅ Validação de tipos MIME
- ✅ Limite de tamanho (50MB)
- ✅ Bucket privado
- ✅ CORS configurado
- ✅ Validação de entrada

## 🧪 Testes

### Teste Completo com curl

```bash
# 1. Gerar URL de upload
RESPONSE=$(curl -s -X POST http://127.0.0.1:3000/anexos/presign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{"filename":"teste.txt","contentType":"text/plain"}')

echo $RESPONSE

# 2. Extrair URL e key
URL=$(echo $RESPONSE | jq -r '.url')
KEY=$(echo $RESPONSE | jq -r '.key')

# 3. Fazer upload
echo "Conteúdo de teste" > teste.txt
curl -X PUT "$URL" \
  -H "Content-Type: text/plain" \
  --data-binary @teste.txt

# 4. Gerar URL de download
curl -s "http://127.0.0.1:3000/anexos/presign?key=$KEY" \
  -H "Authorization: Bearer SEU_TOKEN"

# 5. Deletar arquivo
curl -X DELETE "http://127.0.0.1:3000/anexos/$KEY" \
  -H "Authorization: Bearer SEU_TOKEN"
```

## 🐛 Troubleshooting

### Erro 404 no endpoint
- Verificar se o módulo `AnexosModule` está importado no `AppModule`
- Verificar se a API está rodando na porta 3000

### Erro 500 no presign
- Verificar variáveis de ambiente AWS/MinIO
- Verificar se o bucket existe
- Verificar se as credenciais estão corretas

### Erro CORS no frontend
- Verificar configuração CORS no MinIO
- Verificar se a origem está na lista de permitidas

### Upload falha
- Verificar se a URL assinada não expirou
- Verificar se o Content-Type está correto
- Verificar se o arquivo não excede 50MB

## 📝 Logs

Para debug, verifique os logs da API:
```bash
# Logs da API
docker logs api-container

# Logs do MinIO
docker logs minio-dev
```
