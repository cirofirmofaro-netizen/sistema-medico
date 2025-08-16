# Sistema de Assinatura Digital PKI

Este módulo implementa assinatura digital de documentos clínicos com suporte a múltiplos provedores PKI (A1, A3, HSM/Cloud).

## Funcionalidades

- **Assinatura PAdES**: PDF assinado com certificado digital
- **Assinatura CMS**: Arquivo .p7s separado (PKCS#7)
- **Metadados do Certificado**: Extração automática de subject, issuer, serial
- **Integração S3**: Armazenamento seguro dos artefatos assinados
- **URLs Temporárias**: Acesso controlado aos documentos assinados

## Fluxo de Assinatura

### 1. Solicitar Assinatura
```
POST /assinatura/{documentoId}/request
```

**Response:**
```json
{
  "documentoId": "uuid",
  "hashAlgo": "SHA-256",
  "hashHex": "abc123...",
  "callbackUrl": "http://localhost:3000/assinatura/uuid/callback"
}
```

### 2. Callback de Assinatura
```
POST /assinatura/{documentoId}/callback
```

**Headers:**
```
X-Signature: sha256=abc123... (HMAC do body com SIGN_WEBHOOK_SECRET)
Idempotency-Key: uuid-unico-para-evitar-duplicatas
```

**Body:**
```json
{
  "formato": "PAdES",
  "assinaturaBase64": "base64-do-pdf-assinado",
  "certificadoPem": "-----BEGIN CERTIFICATE-----...",
  "cadeiaPem": ["-----BEGIN CERTIFICATE-----..."],
  "algoritimo": "RSA-SHA256",
  "signerName": "Dr. João Silva",
  "timestampToken": "base64-do-token-tsa"
}
```

### 3. Obter URL do Documento Assinado
```
GET /assinatura/{documentoId}/url
```

**Response:**
```json
{
  "url": "https://s3.amazonaws.com/bucket/file.signed.pdf?signature=...",
  "expires": 300,
  "formato": "PAdES"
}
```

### 4. Validar Certificado Manualmente
```
POST /assinatura/{documentoId}/validate
```

**Response:**
```json
{
  "status": "Validação iniciada",
  "documentoId": "uuid"
}
```

### 5. Revalidar Certificado (útil para testes)
```
POST /assinatura/{documentoId}/revalidate
```

**Response:**
```json
{
  "status": "Revalidação concluída",
  "documentoId": "uuid",
  "certStatus": "VALIDO"
}
```

## Campos do Banco de Dados

O modelo `DocumentoClinico` inclui:

- `assinaturaStatus`: `NAO_ASSINADO` | `ASSINADO`
- `signedAt`: Data/hora da assinatura
- `signerName`: Nome do signatário
- `signerCertSubject`: Subject do certificado (CN=...)
- `signerCertIssuer`: CA emissora
- `signerSerial`: Número de série do certificado
- `assinaturaAlg`: Algoritmo usado (ex: RSA-SHA256)
- `assinaturaFormato`: `PAdES` | `CMS`
- `assinaturaKey`: Chave S3 do arquivo assinado
- `assinaturaHash`: Hash SHA-256 do arquivo assinado
- `signerChainPem`: Array de certificados PEM da cadeia
- `certStatus`: Status do certificado (`VALIDO` | `REVOGADO` | `DESCONHECIDO`)
- `certValidadoEm`: Data/hora da última validação OCSP/CRL

## Integração com Provedores

### Provedor A1/A3
1. App chama `/request` para obter hash
2. Provedor assina o hash com certificado local
3. Provedor chama `/callback` com assinatura

### Provedor HSM/Cloud
1. App chama `/request` para obter hash
2. Provedor assina o hash no HSM/Cloud
3. Provedor chama `/callback` com assinatura

## Variáveis de Ambiente

```env
# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET=your-bucket-name

# API
PUBLIC_BASE_URL=https://your-api.com

# Security - Webhook Signature (OBRIGATÓRIO para produção)
SIGN_WEBHOOK_SECRET=troque-isto-por-um-secret-forte

# Branding - Logo (opcional)
LOGO_BASE64=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA... (base64 da logo)
```

## Testes

Execute os testes com:

```bash
pnpm test assinatura.service.spec.ts
```

## Segurança

- **🔐 Webhook HMAC**: Verificação obrigatória com `SIGN_WEBHOOK_SECRET`
- **⚡ Timing Attack Protection**: Uso de `timingSafeEqual` para comparação segura
- **📝 Raw Body Capture**: Captura do body original para verificação HMAC
- **🔄 Idempotência**: Prevenção de callbacks duplicados com `Idempotency-Key`
- **📊 Auditoria Completa**: Log de todos os eventos com IP, User-Agent e payload resumido
- **🔗 URLs temporárias** (5 minutos)
- **✅ Validação de status** antes de assinar
- **🔒 Extração segura** de metadados do certificado
- **🔐 Hash SHA-256** para integridade
- **📜 Suporte a cadeia** de certificados
- **🔍 Validação OCSP/CRL**: Verificação automática de revogação de certificados

## Testes de Hardening

Execute o script de teste para verificar se o hardening está funcionando:

```bash
# Configurar variável de ambiente
export SIGN_WEBHOOK_SECRET=teste123

# Executar testes
node test-hardening.js
```

O script testa:
- ✅ Request sem HMAC
- ✅ Callback com HMAC válido
- ✅ Callback com HMAC inválido (rejeição)
- ✅ Idempotência (prevenção de duplicatas)

## Validação de Certificados

### 🔍 OCSP/CRL Automático
- **Job periódico**: Executa a cada 12 horas
- **Validação inteligente**: Tenta OCSP do leaf, depois do intermediário
- **Fallback**: Marca como `DESCONHECIDO` se não conseguir validar
- **Limite**: Processa até 50 documentos por execução
- **Critério**: Documentos não validados ou validados há mais de 7 dias

### 📊 Status dos Certificados
- **`VALIDO`**: Certificado verificado e ativo
- **`REVOGADO`**: Certificado revogado pela CA
- **`DESCONHECIDO`**: Não foi possível validar (OCSP indisponível, etc.)

### 🔧 Validação Manual
```bash
POST /assinatura/{documentoId}/validate
```

## Funcionalidades Implementadas

### 🎨 Polimento do PDF
- **Watermark**: "NÃO ASSINADO" em cinza claro no fundo
- **Logo**: Suporte a logo PNG/JPG via `LOGO_BASE64`
- **Hash**: SHA-256 calculado e salvo no banco

### 📦 Export Robusto
- **ZIP com anexos binários**: Streaming S3→ZIP
- **Estrutura organizada**: `prontuario.pdf` + `anexos/arquivo.ext`
- **Tratamento de erros**: Continua se um anexo falhar

### 🔍 Validação de Certificados
- **Revalidação manual**: Endpoint `/revalidate` para testes
- **Job automático**: OCSP/CRL a cada 12 horas
- **Status claro**: `VALIDO`, `REVOGADO`, `DESCONHECIDO`

## Próximos Passos

### 🔧 Melhorias Técnicas
- Implementar validação manual completa
- Adicionar filtros por tipo de documento no export
- Configurar lifecycle S3 para expirar exports em 30 dias
