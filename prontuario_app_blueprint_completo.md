# Estruturação do Projeto para Desenvolvimento no Cursor

## 1) Stack Sugerida
- **Frontend (App)**: React Native (TypeScript) com Expo para acelerar desenvolvimento e suporte a mobile.
- **Backend/API**: Node.js + NestJS (ou Express) para endpoints REST.
- **Banco Local**: SQLite criptografado (expo-sqlite + SQLCipher) para modo offline.
- **Banco Servidor**: PostgreSQL.
- **Auth**: JWT + Refresh Token; suporte a biometria no app.
- **Storage de Arquivos**: S3 compatível (Backblaze, Wasabi) com presigned URLs.
- **Video/Telemedicina**: WebRTC via LiveKit ou Twilio.
- **Notificações Push**: Expo Notifications + Firebase Cloud Messaging.

## 2) Estrutura de Pastas no Cursor
```
/prontuario-app
  /app             # Código do React Native
    /src
      /components
      /screens
      /services
      /hooks
      /contexts
      /navigation
      /utils
      /types
  /server          # Código do backend
    /src
      /modules
        /auth
        /pacientes
        /consultas
        /plantoes
        /telemedicina
      /common
      /config
      /database
  /shared          # Tipos e interfaces comuns (TypeScript)
  package.json
  README.md
```

## 3) Fluxo de Desenvolvimento no Cursor
1. Criar monorepo com **frontend** e **backend**.
2. Implementar **módulo de autenticação** (JWT, refresh, biometria no RN).
3. Criar **módulo de pacientes** com CRUD local + sync.
4. Implementar **agenda** com visualização em lista e calendário.
5. Integrar **telemedicina** com LiveKit/Twilio.
6. Criar **módulo de plantões** (CRUD, relatórios, exportação).
7. Implementar **exportação PDF**.
8. Criar testes unitários e E2E.

## 4) Sprints Técnicos
- **Sprint 1**: Setup do monorepo, auth, estrutura base do banco local e servidor.
- **Sprint 2**: CRUD de pacientes e evoluções.
- **Sprint 3**: Agenda de consultas e notificações.
- **Sprint 4**: Telemedicina (MVP) e integração com prontuário.
- **Sprint 5**: Controle de plantões e relatórios.
- **Sprint 6**: Refino, otimizações e testes finais.

## 5) Próximos Passos no Cursor
1. Criar monorepo com `pnpm` ou `yarn workspaces`.
2. Configurar ambiente RN + Expo no Cursor.
3. Criar backend NestJS com conexão PostgreSQL.
4. Implementar sync inicial de pacientes.
5. Criar UI da tela de login e lista de pacientes.

## 10) Estrutura do projeto no Cursor (blueprint)
**Stack sugerida (opiniada p/ velocidade no Cursor):**
- **App mobile:** React Native + **Expo** (TypeScript), Tamagui/Nativewind, React Navigation, React Query, **Zustand** (estado), **Drizzle** (SQLite) com **SQLCipher** para criptografia local.
- **API:** **NestJS** (TypeScript) + **Prisma** (Postgres 16), Zod para validação, JWT + Refresh, Storage S3-compatível.
- **Tele:** **LiveKit** (self-host ou Cloud) via SDK RN/Web.
- **Assinatura:** adapter (Clicksign/Certisign/Soluti) – a implementar na Sprint 3.
- **Infra:** Docker Compose (db, redis, livekit opcional), **Turso/LibSQL** opcional para sync leve no futuro.

### Monorepo (pnpm + Turbo)
```
prontuario/
  apps/
    mobile/              # Expo app
    api/                 # NestJS
  packages/
    ui/                  # componentes RN compartilhados (Tamagui)
    core/                # schemas Zod, tipos TS, utils
  infra/
    docker-compose.yml
    migrations/          # SQL extras, seeds
  .cursorrules           # instruções p/ Cursor
  turbo.json
  package.json
  pnpm-workspace.yaml
  README.md
```

### Passo a passo (novo repo)
1. `pnpm dlx create-turbo@latest` → template clean (apps + packages).
2. **Mobile:** `pnpm dlx create-expo-app apps/mobile -t blank-typescript`.
3. **API:** `pnpm dlx @nestjs/cli new api` (em `apps/api`).
4. `pnpm i -w` e configure workspaces no `pnpm-workspace.yaml`.

### Scripts raiz `package.json`
```json
{
  "scripts": {
    "dev": "turbo run dev --parallel",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "fmt": "prettier -w .",
    "db:up": "docker compose -f infra/docker-compose.yml up -d",
    "db:down": "docker compose -f infra/docker-compose.yml down -v"
  }
}
```

### `infra/docker-compose.yml`
```yml
version: '3.9'
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: app
      POSTGRES_DB: prontuario
    ports: ["5432:5432"]
    volumes: [pgdata:/var/lib/postgresql/data]
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
  # livekit opcional para dev local
  livekit:
    image: livekit/livekit-server
    command: --dev --bind 0.0.0.0 --node-ip 127.0.0.1
    ports: ["7880:7880", "7881:7881"]
volumes:
  pgdata:
```

### API (NestJS)
**Env (`apps/api/.env`):**
```
DATABASE_URL=postgresql://app:app@localhost:5432/prontuario
JWT_SECRET=change_me
S3_ENDPOINT=http://localhost:9000
S3_BUCKET=prontuario
LIVEKIT_URL=ws://localhost:7880
LIVEKIT_API_KEY=dev
LIVEKIT_API_SECRET=dev
```

**Prisma schema (recorte inicial)** `apps/api/prisma/schema.prisma`:
```prisma
datasource db { provider = "postgresql" url = env("DATABASE_URL") }
generator client { provider = "prisma-client-js" }

model Paciente {
  id            String   @id @default(uuid())
  nome          String
  dtNasc        DateTime?
  cpf           String?  @unique
  telefone      String?
  email         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  consultas     Consulta[]
}

model Consulta {
  id         String   @id @default(uuid())
  pacienteId String?
  paciente   Paciente? @relation(fields: [pacienteId], references: [id])
  tipo       ConsultaTipo
  inicio     DateTime
  fim        DateTime
  status     ConsultaStatus @default(AGENDADA)
  salaId     String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

enum ConsultaTipo { PRESENCIAL TELE }
enum ConsultaStatus { AGENDADA CONCLUIDA CANCELADA }

model Plantao {
  id           String   @id @default(uuid())
  inicio       DateTime
  fim          DateTime
  local        String
  contratante  String
  tipo         String
  valorBruto   Decimal  @db.Decimal(12,2)
  valorLiquido Decimal? @db.Decimal(12,2)
  statusPgto   StatusPgto @default(PENDENTE)
  notas        String?
  pagamentos   PagamentoPlantao[]
  createdAt    DateTime @default(now())
}

enum StatusPgto { PENDENTE PAGO PARCIAL ATRASADO }

model PagamentoPlantao {
  id         String   @id @default(uuid())
  plantaoId  String
  plantao    Plantao  @relation(fields: [plantaoId], references: [id])
  dtPrevista DateTime?
  dtPgto     DateTime?
  valorPago  Decimal  @db.Decimal(12,2)
  comprovanteKey String?
  obs        String?
}
```

**Módulos Nest (exemplo):**
- `auth` (JWT/refresh), `pacientes`, `consultas`, `plantoes`, `tele` (LiveKit), `storage` (S3 presign), `sign` (assinaturas).

**Exemplo controller** `apps/api/src/plantoes/plantoes.controller.ts`:
```ts
@Post() create(@Body() dto: CreatePlantaoDto) { return this.service.create(dto); }
@Get()  list(@Query() q: ListPlantoesDto) { return this.service.list(q); }
@Get(':id') byId(@Param('id') id: string) { return this.service.byId(id); }
@Put(':id') update(@Param('id') id: string, @Body() dto: UpdatePlantaoDto) { return this.service.update(id, dto); }
@Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id); }
@Post(':id/pagamento') pagar(@Param('id') id: string, @Body() dto: RegistrarPagamentoDto) { return this.service.pagar(id, dto); }
```

### Pacote `packages/core` (tipos + validação)
`packages/core/src/schemas.ts`
```ts
import { z } from 'zod';
export const PlantaoSchema = z.object({
  id: z.string().uuid().optional(),
  inicio: z.coerce.date(),
  fim: z.coerce.date(),
  local: z.string().min(2),
  contratante: z.string().min(2),
  tipo: z.string().min(2),
  valorBruto: z.coerce.number().nonnegative(),
  valorLiquido: z.coerce.number().nonnegative().optional(),
  statusPgto: z.enum(['PENDENTE','PAGO','PARCIAL','ATRASADO']).default('PENDENTE'),
  notas: z.string().optional(),
});
export type Plantao = z.infer<typeof PlantaoSchema>;
```

### Mobile (Expo)
**Dependências chave:** `expo-sqlite`, `drizzle-orm`, `expo-secure-store`, `react-native-mmkv`, `@tanstack/react-query`, `@react-navigation/native`, `zustand`, `tamagui`.

**Páginas iniciais:**
- `PacientesList`, `PacienteForm`, `ConsultaForm`, `AgendaScreen (Dia/Semana)`, `TeleRoom`, `PlantoesList`, `PlantaoForm`, `FinanceiroScreen`.

**Navegação base** `apps/mobile/src/App.tsx`:
```tsx
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <RootTabs />
      </NavigationContainer>
    </QueryClientProvider>
  );
}
```

**DB local (Drizzle + SQLite cifrada)** `apps/mobile/src/db/schema.ts` (recorte):
```ts
import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';
export const plantoes = sqliteTable('plantoes', {
  id: text('id').primaryKey(),
  inicio: integer('inicio', { mode: 'timestamp' }),
  fim: integer('fim', { mode: 'timestamp' }),
  local: text('local'),
  contratante: text('contratante'),
  tipo: text('tipo'),
  valorBruto: real('valor_bruto'),
  valorLiquido: real('valor_liquido'),
  statusPgto: text('status_pgto'),
  notas: text('notas'),
});
```

**Service de sync (esqueleto)**
- Outbox local (`sync_outbox`), POST batch para `/sync` na API, idempotência por `uuid`.

### Arquivos úteis para o Cursor
**`.cursorrules` (guia para a IA do Cursor):**
```
You are an expert TS/React Native/NestJS pair-programmer. Prefer TypeScript, Zod, Prisma, Drizzle. Follow the monorepo layout. Keep code minimal, typed, testable. Write unit tests with Vitest/Jest. When unsure, scaffold with best practices and TODOs.
```

**`README.md` (trecho inicial)**
- Setup rápido, comandos `pnpm`, como subir `docker-compose`, como rodar `expo` e `nest` em paralelo, e variáveis de ambiente.

### Fluxos para começar (em ordem)
1) **Infra**: `pnpm db:up` → Postgres/Redis.
2) **API**: configurar Prisma, `pnpm --filter api prisma migrate dev` → `pnpm --filter api start:dev`.
3) **Mobile**: `pnpm --filter mobile expo start`.
4) Criar **Plantões: List + Form** em RN → chamadas à API → persistência local e sync.
5) Adicionar **Agenda** básica (Dia/Semana) → **Consultas**.
6) Integrar **LiveKit** (dev) para uma sala de tele simples.
7) Sprint 3: **Assinaturas** (adapter `/sign`).

> Com isso, o Cursor consegue gerar/editar arquivos conforme esse blueprint. Nas próximas iterações, posso colar prompts prontos para você usar no Cursor (ex.: “gerar PlantaoForm com Zod + React Hook Form”).
