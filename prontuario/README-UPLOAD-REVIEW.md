# Sistema de Upload com Revisão - Plantão Médico

## 📋 Visão Geral

Sistema completo de upload de anexos com revisão antes da confirmação final. Permite que usuários façam upload de arquivos, revisem e confirmem antes de adicionar ao prontuário do paciente.

## 🔄 Fluxo de Funcionamento

```
1. Upload → Bucket Temporário (medibuddy-uploads-temp)
2. Preview → URL assinada para visualização
3. Revisão → Usuário adiciona metadados (título, tipo)
4. Confirmação → Move para bucket definitivo + BD
5. Limpeza → Remove arquivo temporário
```

## 🏗️ Arquitetura

### Backend (NestJS)

#### Endpoints Implementados:

- `POST /anexos/presign-temp` - Gera URL para upload temporário
- `GET /anexos/temp/presign` - Gera URL para preview
- `DELETE /anexos/temp/:key` - Remove arquivo temporário
- `POST /anexos/commit` - Confirma e move para definitivo

#### Serviços:

- `StorageService` - Operações S3/MinIO
- `AnexosService` - Lógica de negócio
- `RetentionService` - Gestão de retenção

### Frontend (React)

#### Componentes:

- `AnexoReviewUploader` - Componente principal
- `anexosClient` - Cliente para API

#### Funcionalidades:

- Drag & Drop de arquivos
- Preview de imagens e PDFs
- Validação de tipos e tamanhos
- Progress bar de upload
- Metadados customizáveis

## ⚙️ Configuração

### Variáveis de Ambiente (.env)

```env
# Storage
S3_BUCKET=medibuddy-anexos
UPLOAD_TEMP_BUCKET=medibuddy-uploads-temp
PRESIGN_EXPIRES_SECONDS_TEMP=600
MAX_UPLOAD_MB=50
MIME_WHITELIST=image/png,image/jpeg,application/pdf
```

### Buckets MinIO

```bash
# Criar buckets
docker exec minio-dev mc mb myminio/medibuddy-anexos
docker exec minio-dev mc mb myminio/medibuddy-uploads-temp
```

## 🚀 Como Usar

### 1. Backend

```bash
# Reiniciar API para carregar .env
cd apps/api
pnpm start:dev
```

### 2. Frontend

```tsx
import { AnexoReviewUploader } from '@/components/AnexoReviewUploader';

function MyComponent() {
  return (
    <AnexoReviewUploader 
      pacienteId="id-do-paciente"
      onUploadComplete={() => console.log('Upload completo!')}
    />
  );
}
```

## 📁 Estrutura de Arquivos

```
apps/api/src/anexos/
├── dto/upload-review.dto.ts     # DTOs para validação
├── anexos.controller.ts         # Endpoints da API
└── anexos.service.ts           # Lógica de negócio

apps/web/src/
├── components/
│   └── AnexoReviewUploader.tsx # Componente principal
└── lib/
    └── anexosClient.ts         # Cliente da API
```

## 🔒 Segurança

- **Validação**: Tipos MIME e tamanhos limitados
- **Autenticação**: JWT obrigatório em todos endpoints
- **CORS**: Configurado para localhost
- **Temporário**: Arquivos só viram prontuário após confirmação
- **Auditoria**: Logs de todas operações

## 🧪 Testes

### Testar Upload

1. Acesse o frontend
2. Arraste arquivo (PNG, JPG, PDF)
3. Aguarde upload e preview
4. Adicione título e tipo
5. Clique em "Confirmar"

### Verificar Buckets

```bash
# Listar arquivos temporários
docker exec minio-dev mc ls myminio/medibuddy-uploads-temp

# Listar arquivos definitivos
docker exec minio-dev mc ls myminio/medibuddy-anexos
```

## 🗑️ Lifecycle

- **Temporário**: Expira em 10 minutos (configurável)
- **Definitivo**: Segue política de retenção do sistema
- **Limpeza**: Job diário remove arquivos temporários antigos

## 🐛 Troubleshooting

### Erro 404 no Upload
- Verificar se buckets existem
- Confirmar configuração do .env
- Reiniciar API após mudanças

### CORS Error
- Verificar configuração MinIO
- Confirmar proxy funcionando

### Preview não carrega
- Verificar URL assinada
- Confirmar Content-Type correto

## 📝 Próximos Passos

- [ ] Lifecycle automático para bucket temporário
- [ ] Validação de integridade (ETag)
- [ ] Upload em lote
- [ ] Compressão de imagens
- [ ] OCR para PDFs
