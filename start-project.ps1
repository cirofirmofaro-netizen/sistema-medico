# 🚀 Script de Inicialização - Plantão Médico
# Este script facilita o setup e execução do projeto

Write-Host "🏥 PLANTÃO MÉDICO - SCRIPT DE INICIALIZAÇÃO" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se Docker está rodando
Write-Host "🔍 Verificando Docker..." -ForegroundColor Yellow
try {
    docker --version | Out-Null
    Write-Host "✅ Docker encontrado" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker não encontrado. Instale o Docker Desktop primeiro." -ForegroundColor Red
    exit 1
}

# Verificar se pnpm está instalado
Write-Host "🔍 Verificando pnpm..." -ForegroundColor Yellow
try {
    pnpm --version | Out-Null
    Write-Host "✅ pnpm encontrado" -ForegroundColor Green
} catch {
    Write-Host "❌ pnpm não encontrado. Instale com: npm install -g pnpm" -ForegroundColor Red
    exit 1
}

# Iniciar serviços Docker
Write-Host ""
Write-Host "🐳 Iniciando serviços Docker..." -ForegroundColor Yellow
docker-compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao iniciar Docker Compose" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Serviços Docker iniciados" -ForegroundColor Green

# Aguardar serviços ficarem prontos
Write-Host "⏳ Aguardando serviços ficarem prontos..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Verificar se PostgreSQL está rodando
Write-Host "🔍 Verificando PostgreSQL..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5433" -TimeoutSec 5 -ErrorAction SilentlyContinue
    Write-Host "✅ PostgreSQL acessível" -ForegroundColor Green
} catch {
    Write-Host "⚠️  PostgreSQL pode não estar pronto ainda. Continuando..." -ForegroundColor Yellow
}

# Verificar se MinIO está rodando
Write-Host "🔍 Verificando MinIO..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:9000" -TimeoutSec 5 -ErrorAction SilentlyContinue
    Write-Host "✅ MinIO acessível" -ForegroundColor Green
} catch {
    Write-Host "⚠️  MinIO pode não estar pronto ainda. Continuando..." -ForegroundColor Yellow
}

# Setup do Backend
Write-Host ""
Write-Host "🔧 Configurando Backend..." -ForegroundColor Yellow
Set-Location "prontuario/apps/api"

# Verificar se .env existe
if (-not (Test-Path ".env")) {
    Write-Host "📝 Criando arquivo .env..." -ForegroundColor Yellow
    @"
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/prontuario"
JWT_SECRET="seu-jwt-secret-aqui-mude-em-producao"
S3_ENDPOINT="http://localhost:9000"
S3_ACCESS_KEY="minioadmin"
S3_SECRET_KEY="minioadmin"
S3_BUCKET="prontuario"
S3_FORCE_PATH_STYLE=true
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ Arquivo .env criado" -ForegroundColor Green
}

# Instalar dependências
Write-Host "📦 Instalando dependências do backend..." -ForegroundColor Yellow
pnpm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao instalar dependências do backend" -ForegroundColor Red
    exit 1
}

# Aplicar migrações
Write-Host "🗄️ Aplicando migrações do banco..." -ForegroundColor Yellow
pnpm prisma migrate dev

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao aplicar migrações" -ForegroundColor Red
    exit 1
}

# Popular banco com dados de teste
Write-Host "🌱 Populando banco com dados de teste..." -ForegroundColor Yellow
pnpm prisma db seed

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao popular banco" -ForegroundColor Red
    exit 1
}

# Setup do Frontend
Write-Host ""
Write-Host "🎨 Configurando Frontend..." -ForegroundColor Yellow
Set-Location "../web"

# Instalar dependências
Write-Host "📦 Instalando dependências do frontend..." -ForegroundColor Yellow
pnpm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao instalar dependências do frontend" -ForegroundColor Red
    exit 1
}

# Voltar para o diretório raiz
Set-Location "../../.."

Write-Host ""
Write-Host "🎉 SETUP CONCLUÍDO COM SUCESSO!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""

# Informações importantes
Write-Host "📋 INFORMAÇÕES IMPORTANTES:" -ForegroundColor Cyan
Write-Host ""

Write-Host "🔐 Credenciais de Teste:" -ForegroundColor Yellow
Write-Host "   João: joao@exemplo.com / 123456" -ForegroundColor White
Write-Host "   Maria: maria@exemplo.com / 123456" -ForegroundColor White
Write-Host ""

Write-Host "🌐 URLs de Acesso:" -ForegroundColor Yellow
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "   Backend API: http://localhost:3000" -ForegroundColor White
Write-Host "   MinIO Console: http://localhost:9000 (minioadmin/minioadmin)" -ForegroundColor White
Write-Host ""

Write-Host "🚀 Comandos para Iniciar:" -ForegroundColor Yellow
Write-Host "   Backend: cd prontuario/apps/api && pnpm start:dev" -ForegroundColor White
Write-Host "   Frontend: cd prontuario/apps/web && pnpm dev" -ForegroundColor White
Write-Host ""

Write-Host "🧪 Testes Disponíveis:" -ForegroundColor Yellow
Write-Host "   node test-both-users.js - Teste de isolamento single-tenant" -ForegroundColor White
Write-Host "   node test-plantao-midnight.js - Teste de plantões noturnos" -ForegroundColor White
Write-Host "   node check-db-sql.js - Auditoria do banco" -ForegroundColor White
Write-Host ""

Write-Host "📚 Documentação:" -ForegroundColor Yellow
Write-Host "   PROJECT_STATUS.md - Status completo do projeto" -ForegroundColor White
Write-Host "   TROUBLESHOOTING.md - Guia de resolução de problemas" -ForegroundColor White
Write-Host "   DOCUMENTATION_CHECKLIST.md - Checklist de documentação" -ForegroundColor White
Write-Host ""

Write-Host "💝 Dedicatória:" -ForegroundColor Magenta
Write-Host "   Para meu amigo virtual - que este projeto seja apenas o começo de uma jornada incrível! 🚀" -ForegroundColor White
Write-Host ""

Write-Host "🎯 PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "   1. Iniciar o backend: cd prontuario/apps/api && pnpm start:dev" -ForegroundColor White
Write-Host "   2. Iniciar o frontend: cd prontuario/apps/web && pnpm dev" -ForegroundColor White
Write-Host "   3. Acessar http://localhost:5173 e fazer login" -ForegroundColor White
Write-Host "   4. Explorar o sistema e testar as funcionalidades" -ForegroundColor White
Write-Host ""

Write-Host "✨ O projeto está pronto para uso!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
