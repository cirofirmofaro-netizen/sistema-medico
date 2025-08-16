# 🚀 Guia de Deploy - Plantão Médico

## 🎯 **VISÃO GERAL**

Este documento fornece instruções completas para fazer o deploy do sistema Plantão Médico em produção, incluindo configuração de ambiente, banco de dados, storage e monitoramento.

## 🏗️ **ARQUITETURA DE PRODUÇÃO**

### **Stack Recomendada**
- **Backend**: NestJS + Node.js 18+
- **Frontend**: React + Vite
- **Database**: PostgreSQL 15+
- **Storage**: AWS S3 ou MinIO
- **Cache**: Redis (opcional)
- **Load Balancer**: Nginx
- **Containerização**: Docker + Docker Compose
- **SSL**: Let's Encrypt
- **Monitoring**: PM2 + Winston

### **Infraestrutura Mínima**
- **CPU**: 2 vCPUs
- **RAM**: 4GB
- **Storage**: 50GB SSD
- **Network**: 100Mbps

## 📋 **PRÉ-REQUISITOS**

### **1. Servidor**
- Ubuntu 22.04 LTS ou similar
- Acesso root ou sudo
- IP público configurado
- Domínio apontando para o servidor

### **2. Software Base**
```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependências
sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar pnpm
sudo npm install -g pnpm

# Instalar Nginx
sudo apt install -y nginx

# Instalar Certbot (SSL)
sudo apt install -y certbot python3-certbot-nginx
```

## 🔧 **CONFIGURAÇÃO DO AMBIENTE**

### **1. Estrutura de Diretórios**
```bash
# Criar diretório do projeto
sudo mkdir -p /opt/plantao-medico
sudo chown $USER:$USER /opt/plantao-medico
cd /opt/plantao-medico

# Clonar repositório
git clone <seu-repositorio> .
```

### **2. Variáveis de Ambiente**
```bash
# Backend (.env)
cat > prontuario/apps/api/.env << EOF
# Database
DATABASE_URL="postgresql://postgres:${DB_PASSWORD}@localhost:5432/plantao_medico"

# JWT
JWT_SECRET="${JWT_SECRET}"

# Storage
S3_ENDPOINT="${S3_ENDPOINT}"
S3_ACCESS_KEY="${S3_ACCESS_KEY}"
S3_SECRET_KEY="${S3_SECRET_KEY}"
S3_BUCKET="plantao-medico"
S3_FORCE_PATH_STYLE=true

# App
NODE_ENV=production
PORT=3000
CORS_ORIGIN="${FRONTEND_URL}"

# Logs
LOG_LEVEL=info
EOF

# Frontend (.env)
cat > prontuario/apps/web/.env << EOF
VITE_API_URL="${BACKEND_URL}"
VITE_APP_NAME="Plantão Médico"
EOF
```

### **3. Configuração do Banco de Dados**
```bash
# Criar usuário e banco
sudo -u postgres psql << EOF
CREATE USER plantao_user WITH PASSWORD '${DB_PASSWORD}';
CREATE DATABASE plantao_medico OWNER plantao_user;
GRANT ALL PRIVILEGES ON DATABASE plantao_medico TO plantao_user;
\q
EOF

# Aplicar migrações
cd prontuario/apps/api
pnpm prisma migrate deploy
pnpm prisma db seed
```

## 🐳 **DOCKER COMPOSE**

### **docker-compose.prod.yml**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: plantao_postgres
    environment:
      POSTGRES_DB: plantao_medico
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    ports:
      - "127.0.0.1:5432:5432"
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 30s
      timeout: 10s
      retries: 3

  redis:
    image: redis:7-alpine
    container_name: plantao_redis
    volumes:
      - redis_data:/data
    ports:
      - "127.0.0.1:6379:6379"
    restart: unless-stopped

  minio:
    image: minio/minio:latest
    container_name: plantao_minio
    environment:
      MINIO_ROOT_USER: ${S3_ACCESS_KEY}
      MINIO_ROOT_PASSWORD: ${S3_SECRET_KEY}
    volumes:
      - minio_data:/data
    ports:
      - "127.0.0.1:9000:9000"
      - "127.0.0.1:9001:9001"
    command: server /data --console-address ":9001"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3

  api:
    build:
      context: ./prontuario/apps/api
      dockerfile: Dockerfile.prod
    container_name: plantao_api
    environment:
      - NODE_ENV=production
    volumes:
      - ./logs:/app/logs
    ports:
      - "127.0.0.1:3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  web:
    build:
      context: ./prontuario/apps/web
      dockerfile: Dockerfile.prod
    container_name: plantao_web
    ports:
      - "127.0.0.1:5173:80"
    depends_on:
      - api
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

### **Dockerfile.prod (Backend)**
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS production

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

EXPOSE 3000
CMD ["node", "dist/main"]
```

### **Dockerfile.prod (Frontend)**
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine AS production

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🌐 **NGINX CONFIGURAÇÃO**

### **nginx.conf**
```nginx
events {
    worker_connections 1024;
}

http {
    upstream api {
        server 127.0.0.1:3000;
    }

    upstream web {
        server 127.0.0.1:5173;
    }

    server {
        listen 80;
        server_name seu-dominio.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name seu-dominio.com;

        ssl_certificate /etc/letsencrypt/live/seu-dominio.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com/privkey.pem;

        # SSL Configuration
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;

        # Security Headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # API Routes
        location /api/ {
            proxy_pass http://api/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            proxy_read_timeout 300s;
            proxy_connect_timeout 75s;
        }

        # Frontend Routes
        location / {
            proxy_pass http://web/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # Health Check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

## 🔒 **SSL CERTIFICATE**

### **Let's Encrypt**
```bash
# Obter certificado SSL
sudo certbot --nginx -d seu-dominio.com

# Renovar automaticamente
sudo crontab -e
# Adicionar linha:
0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 **MONITORAMENTO**

### **PM2 Configuration**
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'plantao-api',
    script: 'dist/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
```

### **Logs Configuration**
```typescript
// apps/api/src/main.ts
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

const logger = WinstonModule.createLogger({
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  ]
});
```

## 🔄 **BACKUP E RECOVERY**

### **Script de Backup**
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/plantao-medico/backups"

# Backup do banco
docker exec plantao_postgres pg_dump -U postgres plantao_medico > $BACKUP_DIR/db_$DATE.sql

# Backup dos arquivos
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /opt/plantao-medico/uploads

# Limpar backups antigos (manter 30 dias)
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup concluído: $DATE"
```

### **Script de Restore**
```bash
#!/bin/bash
# restore.sh

BACKUP_FILE=$1
BACKUP_DIR="/opt/plantao-medico/backups"

if [ -z "$BACKUP_FILE" ]; then
    echo "Uso: $0 <arquivo_backup>"
    exit 1
fi

# Restaurar banco
docker exec -i plantao_postgres psql -U postgres plantao_medico < $BACKUP_DIR/$BACKUP_FILE

echo "Restore concluído: $BACKUP_FILE"
```

## 🚀 **DEPLOY SCRIPT**

### **deploy.sh**
```bash
#!/bin/bash

echo "🚀 Iniciando deploy do Plantão Médico..."

# Parar serviços
docker-compose -f docker-compose.prod.yml down

# Pull das imagens
git pull origin main

# Build das imagens
docker-compose -f docker-compose.prod.yml build

# Aplicar migrações
cd prontuario/apps/api
pnpm prisma migrate deploy

# Subir serviços
cd /opt/plantao-medico
docker-compose -f docker-compose.prod.yml up -d

# Verificar saúde
sleep 30
curl -f http://localhost:3000/health || echo "❌ API não está saudável"
curl -f http://localhost:5173 || echo "❌ Frontend não está saudável"

echo "✅ Deploy concluído!"
```

## 📋 **CHECKLIST DE DEPLOY**

### **Pré-Deploy**
- [ ] Servidor configurado com requisitos mínimos
- [ ] Domínio apontando para o servidor
- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados criado
- [ ] SSL certificate obtido

### **Deploy**
- [ ] Código atualizado no servidor
- [ ] Docker Compose configurado
- [ ] Migrações aplicadas
- [ ] Serviços iniciados
- [ ] Health checks passando

### **Pós-Deploy**
- [ ] SSL funcionando
- [ ] Frontend acessível
- [ ] API respondendo
- [ ] Upload de arquivos funcionando
- [ ] Backup configurado
- [ ] Monitoramento ativo

## 🔧 **MANUTENÇÃO**

### **Comandos Úteis**
```bash
# Ver logs
docker-compose -f docker-compose.prod.yml logs -f api

# Reiniciar serviço
docker-compose -f docker-compose.prod.yml restart api

# Backup manual
./backup.sh

# Atualizar sistema
./deploy.sh

# Verificar saúde
curl http://localhost:3000/health
```

### **Monitoramento**
```bash
# Status dos containers
docker-compose -f docker-compose.prod.yml ps

# Uso de recursos
docker stats

# Logs em tempo real
docker-compose -f docker-compose.prod.yml logs -f
```

## 🆘 **TROUBLESHOOTING**

### **Problemas Comuns**

#### **API não inicia**
```bash
# Verificar logs
docker-compose -f docker-compose.prod.yml logs api

# Verificar variáveis de ambiente
docker-compose -f docker-compose.prod.yml exec api env

# Verificar conectividade com banco
docker-compose -f docker-compose.prod.yml exec api ping postgres
```

#### **Banco de dados não conecta**
```bash
# Verificar se PostgreSQL está rodando
docker-compose -f docker-compose.prod.yml ps postgres

# Verificar logs do PostgreSQL
docker-compose -f docker-compose.prod.yml logs postgres

# Testar conexão
docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres -d plantao_medico
```

#### **SSL não funciona**
```bash
# Verificar certificado
sudo certbot certificates

# Renovar certificado
sudo certbot renew

# Verificar configuração do Nginx
sudo nginx -t
```

---

*Última atualização: Dezembro 2024*
*Versão: 1.0.0*
*Status: Pronto para produção*
