# Prontuário Médico

Sistema completo de prontuário médico com aplicação mobile (React Native + Expo) e API backend (NestJS).

## 🏗️ Arquitetura

- **Mobile App**: React Native + Expo (TypeScript)
- **API Backend**: NestJS + Prisma + PostgreSQL
- **Database**: PostgreSQL (produção) + SQLite (mobile offline)
- **Telemedicina**: LiveKit
- **Autenticação**: JWT + Refresh Token
- **Monorepo**: Turbo + pnpm

## 🚀 Setup Rápido

### Pré-requisitos

- Node.js 18+
- pnpm
- Docker Desktop
- Expo CLI (opcional)

### 1. Clone e Instale

```bash
git clone <repo-url>
cd prontuario
pnpm install
```

### 2. Configure o Banco de Dados

```bash
# Suba PostgreSQL, Redis e LiveKit
pnpm db:up

# Configure as variáveis de ambiente
cp apps/api/env.example apps/api/.env
# Edite apps/api/.env com suas configurações

# Execute as migrações
pnpm db:migrate
```

### 3. Execute o Desenvolvimento

```bash
# Desenvolvimento paralelo (mobile + api)
pnpm dev

# Ou individualmente:
pnpm --filter api dev      # API em http://localhost:3000
pnpm --filter mobile dev   # Expo em http://localhost:8081
```

## 📱 Mobile App

### Estrutura

```
apps/mobile/
├── src/
│   ├── components/     # Componentes reutilizáveis
│   ├── screens/        # Telas da aplicação
│   ├── navigation/     # Configuração de navegação
│   ├── services/       # APIs e serviços
│   ├── hooks/          # Custom hooks
│   ├── utils/          # Utilitários
│   └── types/          # Tipos TypeScript
```

### Principais Dependências

- `expo-sqlite` + `drizzle-orm` (banco local)
- `@tanstack/react-query` (cache e sync)
- `@react-navigation/native` (navegação)
- `zustand` (estado global)
- `tamagui` (UI components)

## 🔌 API Backend

### Estrutura

```
apps/api/
├── src/
│   ├── modules/        # Módulos NestJS
│   │   ├── auth/       # Autenticação
│   │   ├── pacientes/  # CRUD pacientes
│   │   ├── consultas/  # Agenda e consultas
│   │   ├── plantoes/   # Controle de plantões
│   │   └── tele/       # Telemedicina
│   ├── common/         # Decorators, guards, etc
│   └── config/         # Configurações
```

### Principais Dependências

- `@nestjs/prisma` (ORM)
- `@nestjs/jwt` (autenticação)
- `zod` (validação)
- `class-validator` (DTOs)

## 📦 Pacotes Compartilhados

### `@prontuario/core`

Schemas Zod e tipos TypeScript compartilhados entre mobile e API.

```typescript
import { PacienteSchema, PlantaoSchema } from '@prontuario/core';
```

### `@prontuario/ui`

Componentes React Native reutilizáveis.

## 🗄️ Banco de Dados

### Schema Principal (PostgreSQL)

- **Pacientes**: Dados dos pacientes
- **Consultas**: Agenda e histórico
- **Plantões**: Controle de plantões médicos
- **Pagamentos**: Controle financeiro

### Sync Mobile

- SQLite local criptografado
- Sync automático quando online
- Outbox para operações offline

## 🔐 Autenticação

- JWT + Refresh Token
- Biometria no mobile (Expo Local Authentication)
- Middleware de proteção nas rotas

## 📅 Agenda

- Visualização diária/semanal
- Agendamento de consultas
- Notificações push
- Integração com telemedicina

## 💰 Controle de Plantões

- CRUD completo de plantões
- Controle de pagamentos
- Relatórios e exportação
- Dashboard financeiro

## 🎥 Telemedicina

- Integração com LiveKit
- Salas virtuais
- Chat em tempo real
- Gravação de consultas

## 🧪 Testes

```bash
# Testes unitários
pnpm test

# Testes E2E
pnpm test:e2e

# Cobertura
pnpm test:cov
```

## 🚀 Deploy

### API (NestJS)

```bash
# Build para produção
pnpm --filter api build

# Deploy com Docker
docker build -f apps/api/Dockerfile .
```

### Mobile (Expo)

```bash
# Build para produção
pnpm --filter mobile build:android
pnpm --filter mobile build:ios

# Deploy para stores
pnpm --filter mobile submit
```

## 📝 Scripts Úteis

```bash
# Desenvolvimento
pnpm dev                    # Mobile + API
pnpm --filter api dev       # Apenas API
pnpm --filter mobile dev    # Apenas Mobile

# Banco de dados
pnpm db:up                  # Subir containers
pnpm db:down                # Parar containers
pnpm db:migrate             # Executar migrações
pnpm db:studio              # Abrir Prisma Studio

# Build e deploy
pnpm build                  # Build completo
pnpm lint                   # Lint em todos os pacotes
pnpm format                 # Formatar código
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.
