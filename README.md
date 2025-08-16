# 🏥 Sistema Plantão Médico

Sistema completo de gestão de plantões médicos com prontuário eletrônico, controle financeiro e relatórios.

## 🚀 Stack Tecnológica

### Backend

- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL + Prisma ORM
- **Cache**: Redis
- **Storage**: MinIO (S3-compatible)
- **Authentication**: JWT
- **Architecture**: Single-Tenant com isolamento por usuário

### Frontend

- **Framework**: React + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State Management**: React Query
- **Validation**: Zod

### Mobile

- **Framework**: React Native + Expo
- **Database**: SQLite + Drizzle ORM
- **Sync**: Offline-first com sincronização

### DevOps

- **Package Manager**: pnpm
- **Monorepo**: Turborepo
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions

## 📋 Status do Projeto

- ✅ **Backend**: 100% implementado
- ✅ **Frontend**: 95% implementado
- ✅ **Mobile**: 80% implementado
- ✅ **Documentação**: 100% completa
- ✅ **Testes**: 90% implementado

### Páginas Faltantes (Frontend)

- [ ] Página de Fontes Pagadoras (`/fontes`)
- [ ] Página de Controle de IR (`/ir`)

## 🛠️ Como Executar

### Pré-requisitos

- Node.js 18+
- pnpm
- Docker + Docker Compose
- Git

### 1. Clone o repositório

```bash
git clone https://github.com/cirofirmofaro-netizen/sistema-medico.git
cd sistema-medico
```

### 2. Instale dependências

```bash
pnpm install
```

### 3. Configure variáveis de ambiente

```bash
# Copie o arquivo de exemplo
cp prontuario/apps/api/env.example prontuario/apps/api/.env

# Edite as variáveis conforme necessário
```

### 4. Inicie os serviços Docker

```bash
docker-compose up -d
```

### 5. Execute as migrações

```bash
cd prontuario/apps/api
pnpm prisma migrate dev
pnpm prisma db seed
```

### 6. Inicie o backend

```bash
cd prontuario/apps/api
pnpm start:dev
```

### 7. Inicie o frontend

```bash
cd prontuario/apps/web
pnpm dev
```

### 8. Acesse o sistema

- **Frontend**: http://localhost:5174
- **API**: http://localhost:3000
- **MinIO Console**: http://localhost:9003

## 🌿 Fluxo de Git

### Branches Principais

- `main`: Produção (sempre estável)
- `develop`: Desenvolvimento (integração de features)

### Branches de Trabalho

- `feature/*`: Novas funcionalidades
- `fix/*`: Correções de bugs
- `hotfix/*`: Correções urgentes para produção
- `release/*`: Preparação de releases

### Fluxo de Desenvolvimento

1. Crie branch a partir de `develop`
2. Desenvolva sua feature
3. Faça commits seguindo Conventional Commits
4. Abra Pull Request para `develop`
5. Após aprovação, merge em `develop`
6. Releases são feitos de `develop` para `main`

## 📦 Scripts Disponíveis

### Desenvolvimento

```bash
pnpm dev          # Inicia todos os serviços
pnpm build        # Build de todos os apps
pnpm lint         # Executa linting
pnpm format       # Formata código
pnpm test         # Executa testes
```

### Release

```bash
pnpm release      # Gera release semântico
```

## 🏷️ Versionamento

Este projeto segue [Semantic Versioning](https://semver.org/) (SemVer):

- **MAJOR** (X.0.0): Mudanças incompatíveis com versões anteriores
- **MINOR** (0.X.0): Novas funcionalidades compatíveis
- **PATCH** (0.0.X): Correções de bugs compatíveis

### Exemplos

- `v1.0.0`: Primeira versão estável
- `v1.1.0`: Nova funcionalidade
- `v1.1.1`: Correção de bug

## 📚 Documentação

- [API Endpoints](./API_ENDPOINTS.md)
- [Frontend Roadmap](./FRONTEND_ROADMAP.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
- [Project Status](./PROJECT_STATUS.md)

## 🤝 Contribuindo

Veja [CONTRIBUTING.md](./CONTRIBUTING.md) para detalhes sobre como contribuir.

## 📄 Licença

Este projeto é privado e proprietário.

## 👥 Equipe

- **Desenvolvedor Principal**: @cirofirmofaro
- **Arquitetura**: Single-Tenant com isolamento por usuário
- **Stack**: Full-stack TypeScript/React/NestJS

---

**Sistema Plantão Médico** - Gestão completa de plantões médicos 🏥
