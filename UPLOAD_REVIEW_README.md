# 📁 Sistema de Upload com Revisão - Anexos do Prontuário

## 🎯 **Visão Geral**

Sistema de upload de anexos com revisão antes da confirmação, implementando o fluxo **Temp → Review → Commit** para garantir a qualidade dos documentos antes de serem adicionados ao prontuário.

## 🔄 **Fluxo de Funcionamento**

### 1. **Upload Temporário**
- Arquivo é enviado para bucket temporário (`medibuddy-uploads-temp`)
- Geração de URL assinada para upload direto (PUT)
- Validação de tipo MIME e tamanho antes do upload

### 2. **Revisão**
- Pré-visualização inline de imagens e PDFs
- Informações detalhadas (nome, tamanho, tipo)
- Possibilidade de remover arquivos antes da confirmação

### 3. **Commit**
- Movimento do arquivo do bucket temporário para definitivo
- Criação do registro no banco de dados
- Aplicação da política de retenção (Lei 13.787/2018)
- Exclusão do arquivo temporário

## 🛠 **Configuração**

### **Variáveis de Ambiente**

```env
# Upload com revisão
UPLOAD_TEMP_BUCKET=medibuddy-uploads-temp
PRESIGN_EXPIRES_SECONDS_TEMP=600
MAX_UPLOAD_MB=50
MIME_WHITELIST=image/png,image/jpeg,application/pdf
```

### **Buckets MinIO**

```bash
# Criar bucket temporário
docker exec -it minio-dev mc mb minio/medibuddy-uploads-temp

# Verificar buckets
docker exec -it minio-dev mc ls minio
```

## 📋 **Endpoints da API**

### **Upload Temporário**
```http
POST /anexos/presign-temp
Content-Type: application/json

{
  "filename": "exame.pdf",
  "contentType": "application/pdf",
  "size": 1024000
}
```

### **Visualização Temporária**
```http
GET /anexos/temp/presign?key=temp/2025/08/14/uuid-exame.pdf&inline=true
```

### **Exclusão Temporária**
```http
DELETE /anexos/temp/{key}
```

### **Commit**
```http
POST /anexos/commit
Content-Type: application/json

{
  "keyTemp": "temp/2025/08/14/uuid-exame.pdf",
  "pacienteId": "uuid-paciente",
  "contentType": "application/pdf",
  "filename": "exame.pdf",
  "size": 1024000,
  "tipo": "Exame Laboratorial",
  "observacao": "Hemograma completo"
}
```

## 🎨 **Frontend**

### **Componente Principal**
```tsx
<AnexoReviewUploader
  pacienteId={patient.id}
  onSuccess={() => {
    // Atualizar lista de anexos
    queryClient.invalidateQueries(['patient-files', patient.id]);
  }}
  onCancel={() => setShowUploader(false)}
/>
```

### **Funcionalidades**
- ✅ Drag & drop de múltiplos arquivos
- ✅ Validação em tempo real
- ✅ Pré-visualização de imagens e PDFs
- ✅ Barra de progresso no upload
- ✅ Confirmação individual por arquivo
- ✅ Remoção antes da confirmação

## 🔒 **Segurança**

### **Validações**
- **Tipos MIME**: Apenas PNG, JPG, PDF
- **Tamanho**: Máximo 50MB por arquivo
- **URLs Assinadas**: Expiração em 10 minutos
- **Autenticação**: JWT obrigatório em todos os endpoints

### **Compliance**
- **LGPD**: Trilhas de auditoria completas
- **Lei 13.787/2018**: Retenção de 20 anos
- **Soft Delete**: Arquivos não são excluídos fisicamente antes do prazo

## 🧹 **Limpeza Automática**

### **Lifecycle do Bucket Temporário**
```bash
# Configurar regra de expiração (MinIO)
docker exec -it minio-dev mc ilm add minio/medibuddy-uploads-temp --expiry-days 1
```

### **Job de Limpeza Manual**
```bash
# Listar arquivos temporários antigos
docker exec -it minio-dev mc find minio/medibuddy-uploads-temp --older-than 1d

# Remover arquivos antigos
docker exec -it minio-dev mc rm minio/medibuddy-uploads-temp --recursive --older-than 1d
```

## 🚀 **Uso**

### **1. Iniciar Serviços**
```bash
# Backend
cd apps/api && npm run start:dev

# Frontend
cd apps/web && npm run dev

# MinIO
docker-compose up -d minio
```

### **2. Acessar Sistema**
- Frontend: http://localhost:5174
- MinIO Console: http://localhost:9001
- API Docs: http://localhost:3000/docs

### **3. Testar Upload**
1. Navegar para detalhes do paciente
2. Aba "Anexos"
3. Clicar em "Upload Arquivo"
4. Arrastar arquivos ou clicar para selecionar
5. Revisar pré-visualizações
6. Confirmar arquivos desejados

## 🔧 **Troubleshooting**

### **Erro 400 - Tipo não permitido**
- Verificar se o arquivo é PNG, JPG ou PDF
- Verificar configuração `MIME_WHITELIST`

### **Erro 413 - Arquivo muito grande**
- Verificar tamanho do arquivo (máx. 50MB)
- Verificar configuração `MAX_UPLOAD_MB`

### **Erro 404 - Bucket não encontrado**
```bash
# Criar bucket temporário
docker exec -it minio-dev mc mb minio/medibuddy-uploads-temp
```

### **URLs assinadas expirando**
- Verificar configuração `PRESIGN_EXPIRES_SECONDS_TEMP`
- Aumentar tempo se necessário

## 📊 **Monitoramento**

### **Logs Importantes**
```bash
# Backend
npm run start:dev | grep -E "(upload|anexo|temp)"

# MinIO
docker logs minio-dev | grep -E "(PUT|GET|DELETE)"
```

### **Métricas**
- Arquivos temporários por dia
- Taxa de confirmação vs. remoção
- Tempo médio de revisão
- Erros de upload por tipo

## 🔄 **Migração para Produção**

### **AWS S3**
```env
STORAGE_PROVIDER=S3
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-1
S3_BUCKET=medibuddy-anexos
UPLOAD_TEMP_BUCKET=medibuddy-uploads-temp
# Remover S3_ENDPOINT e S3_FORCE_PATH_STYLE
```

### **Lifecycle AWS S3**
```json
{
  "Rules": [
    {
      "ID": "TempExpiration",
      "Status": "Enabled",
      "Filter": {
        "Prefix": "temp/"
      },
      "Expiration": {
        "Days": 1
      }
    }
  ]
}
```

---

**✅ Sistema implementado e pronto para uso!**
