# 🔧 Troubleshooting - Plantão Médico

## 🚨 **PROBLEMAS CRÍTICOS RESOLVIDOS**

### **1. Isolamento Single-Tenant Não Funcionando**

#### **❌ Problema**
- Usuários viam dados de outros usuários
- `UsuarioId: undefined` nos logs
- Middleware não aplicando filtros

#### **✅ Solução Implementada**
```typescript
// 1. TenantContextInterceptor com AsyncLocalStorage
export class TenantContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const usuarioId = request.user?.id;
    
    if (usuarioId) {
      return TenantContext.run(usuarioId, () => {
        return next.handle();
      });
    }
    return next.handle();
  }
}

// 2. PrismaService com middleware global
private applyTenantMiddleware() {
  this.$use(async (params, next) => {
    const userId = TenantContext.getUserId();
    
    if (userId && tenantModels.includes(params.model)) {
      // Aplicar filtros baseado na ação
      switch (params.action) {
        case 'findMany':
          params.args.where = { ...params.args.where, usuarioId: userId };
          break;
        case 'create':
          params.args.data = { ...params.args.data, usuarioId: userId };
          break;
        // ... outros casos
      }
    }
    return next(params);
  });
}
```

#### **🔍 Debug**
```bash
# Teste de isolamento
node test-both-users.js

# Auditoria no banco
node check-db-sql.js

# Logs detalhados
# Verificar: "TenantContext set for usuarioId: xxx"
```

### **2. Validação de Plantões Noturnos**

#### **❌ Problema**
- Plantões 19:00-07:00 rejeitados
- "Horário de fim deve ser posterior ao início"

#### **✅ Solução Implementada**
```typescript
// Validação corrigida
}).refine((data) => {
  const [inicioHora, inicioMin] = data.inicioPadrao.split(':').map(Number);
  const [fimHora, fimMin] = data.fimPadrao.split(':').map(Number);
  
  const inicioMinutos = inicioHora * 60 + inicioMin;
  const fimMinutos = fimHora * 60 + fimMin;
  
  // Permitir atravessar meia-noite, apenas não permitir duração zero
  return fimMinutos !== inicioMinutos;
}, {
  message: 'Horário de fim não pode ser igual ao de início',
  path: ['fimPadrao'],
});
```

#### **🧪 Teste**
```bash
node test-plantao-midnight.js
```

### **3. Upload de Anexos com Preview**

#### **❌ Problema**
- Preview não funcionava
- CORS errors
- Fluxo confuso

#### **✅ Solução Implementada**
```typescript
// 1. Fluxo de upload com review
const uploadFlow = {
  step1: 'generate-presigned-url', // Bucket temporário
  step2: 'upload-file',           // Upload direto
  step3: 'preview-file',          // Preview
  step4: 'commit-file',           // Mover para permanente
  step5: 'delete-temp'            // Limpar temporário
};

// 2. CORS configurado
const corsConfig = {
  origin: ['http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['*']
};
```

## 🔧 **PROBLEMAS COMUNS E SOLUÇÕES**

### **Backend (NestJS)**

#### **1. Erro de Compilação TypeScript**
```bash
# Erro: Property 'usuarioId' is missing
# Solução: Usar 'as any' temporariamente
data: { ...createPlantaoDto } as any
```

#### **2. Prisma Migration Failed**
```bash
# Erro: Could not find Prisma Schema
pnpm prisma migrate reset --force
pnpm prisma migrate dev --name add-single-tenant-isolation
pnpm prisma db seed
```

#### **3. JWT Token Inválido**
```bash
# Verificar .env
JWT_SECRET=your-secret-key

# Verificar token no frontend
localStorage.getItem('token')
```

#### **4. Database Connection**
```bash
# Verificar porta PostgreSQL
DATABASE_URL="postgresql://user:pass@localhost:5433/prontuario"

# Verificar Docker
docker-compose ps
docker-compose logs postgres
```

### **Frontend (React)**

#### **1. React Query Cache Issues**
```typescript
// Limpar cache no logout
const logout = () => {
  queryClient.clear();
  localStorage.clear();
  // ...
};
```

#### **2. Upload de Arquivos**
```typescript
// Verificar CORS
const uploadConfig = {
  headers: {
    'Content-Type': file.type,
  },
  withCredentials: true
};
```

#### **3. Validação Zod**
```typescript
// Erro de validação
// Verificar schema em validators.ts
// Usar zodResolver no useForm
```

### **Docker e Infraestrutura**

#### **1. Porta 5433 Ocupada**
```yaml
# docker-compose.yml
services:
  postgres:
    ports:
      - "5434:5432"  # Mudar porta externa
```

#### **2. MinIO Não Acessível**
```bash
# Verificar credenciais
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
S3_ENDPOINT=http://localhost:9000

# Verificar CORS no MinIO
mc admin config set myminio cors: <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {"AWS": "*"},
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::prontuario/*"]
    }
  ]
}
EOF
```

#### **3. Redis Connection (se usado)**
```bash
# Verificar Redis
docker-compose logs redis
redis-cli ping
```

## 🧪 **SCRIPTS DE DEBUG**

### **1. Teste de Isolamento Single-Tenant**
```bash
# test-both-users.js
node test-both-users.js

# Resultado esperado:
# ✅ João: 2 fontes pagadoras
# ✅ Maria: 1 fonte pagadora
# ✅ Isolamento 100% funcional
```

### **2. Teste de Plantões Noturnos**
```bash
# test-plantao-midnight.js
node test-plantao-midnight.js

# Resultado esperado:
# ✅ Plantão 19:00-07:00 criado
# ✅ Plantão 08:00-18:00 criado
# ✅ Duração calculada corretamente
```

### **3. Auditoria do Banco**
```bash
# check-db-sql.js
node check-db-sql.js

# Verifica:
# - usuarioId NOT NULL
# - Índices criados
# - Dados isolados
```

### **4. Debug Detalhado**
```bash
# debug-tenant.js
node debug-tenant.js

# Logs detalhados de:
# - Login
# - Queries
# - Middleware
# - Isolamento
```

## 📊 **LOGS E MONITORAMENTO**

### **Backend Logs**
```bash
# Desenvolvimento
cd apps/api
pnpm start:dev

# Logs importantes:
# 🔍 Interceptor - UsuarioId: xxx
# ✅ TenantContext set for usuarioId: xxx
# [PRISMA][MW] before/after
```

### **Frontend Logs**
```javascript
// Console do navegador
// Verificar:
// - React Query cache
// - API calls
// - Upload progress
// - Validation errors
```

### **Database Logs**
```bash
# PostgreSQL
docker-compose logs postgres

# MinIO
docker-compose logs minio

# Redis (se usado)
docker-compose logs redis
```

## 🔒 **SEGURANÇA E VALIDAÇÕES**

### **1. Single-Tenant Validation**
```sql
-- Verificar isolamento
SELECT usuario_id, COUNT(*) FROM pacientes GROUP BY usuario_id;
SELECT usuario_id, COUNT(*) FROM plantoes GROUP BY usuario_id;

-- Verificar constraints
\d+ pacientes
\d+ plantoes
```

### **2. JWT Token Validation**
```javascript
// Verificar token
const token = localStorage.getItem('token');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('User ID:', payload.id);
}
```

### **3. Storage Isolation**
```bash
# Verificar S3/MinIO
mc ls myminio/prontuario/user/
# Deve mostrar pastas por usuário
```

## 🚀 **PERFORMANCE E OTIMIZAÇÃO**

### **1. Database Indexes**
```sql
-- Índices compostos para performance
CREATE INDEX IF NOT EXISTS idx_pacientes_usuario_id ON pacientes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_plantoes_usuario_data ON plantoes(usuario_id, data);
```

### **2. React Query Optimization**
```typescript
// Configuração otimizada
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
    },
  },
});
```

### **3. Upload Optimization**
```typescript
// Chunk upload para arquivos grandes
const chunkSize = 5 * 1024 * 1024; // 5MB chunks
const uploadChunks = async (file) => {
  // Implementar upload em chunks
};
```

## 📞 **SUPORTE E CONTATO**

### **Quando Usar Este Guia**
- ✅ Problemas de isolamento de dados
- ✅ Erros de validação
- ✅ Problemas de upload
- ✅ Issues de performance
- ✅ Problemas de autenticação

### **Quando Procurar Ajuda Externa**
- ❌ Bugs não documentados
- ❌ Problemas de infraestrutura complexos
- ❌ Requisitos de segurança específicos
- ❌ Otimizações avançadas

---

*Última atualização: Dezembro 2024*
*Status: Guia completo com todas as soluções implementadas*
