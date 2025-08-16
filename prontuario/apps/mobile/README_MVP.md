# MVP Mobile - Prontuário Médico

## Visão Geral

Este MVP implementa um sistema de prontuário médico mobile com funcionalidades offline-first para gerenciamento de pacientes e consultas.

## Funcionalidades Implementadas

### 🔐 Autenticação
- Tela de login com validação
- Armazenamento seguro de JWT no SecureStore
- Verificação automática de autenticação
- Logout automático em caso de token expirado

### 👥 Gestão de Pacientes
- **Lista de Pacientes**: Busca local, paginação, indicador de status offline
- **Formulário de Paciente**: CRUD completo com validações
- **Campos**: Nome, CPF, data de nascimento, sexo, email, telefone, observações
- **Funcionalidades**: Criação, edição, exclusão (soft delete)

### 📅 Gestão de Consultas
- **Lista de Consultas**: Visualização em lista ou calendário
- **Formulário de Consulta**: CRUD completo com validações avançadas
- **Campos**: Paciente, data/hora início/fim, tipo (presencial/tele), status, local, observações
- **Validações**: Duração mínima 10min, conflitos de horário, local obrigatório para presencial

### 🔄 Sincronização Offline-First
- **Banco Local**: SQLite com Drizzle ORM
- **Sincronização Bidirecional**: Pull (servidor → local) e Push (local → servidor)
- **Outbox Pattern**: Operações offline enfileiradas para sincronização
- **Conflitos**: Resolução por last-write-wins (servidor autoritativo)
- **Triggers**: Sync automático em app foreground, login, e manual

### 📱 Interface do Usuário
- **Design Moderno**: Interface limpa e intuitiva
- **Indicador de Sync**: Status de sincronização em tempo real
- **Estados de Loading**: Skeletons e spinners apropriados
- **Empty States**: Mensagens informativas quando não há dados
- **Navegação**: Tabs principais + stack navigation para formulários

## Arquitetura Técnica

### Estrutura de Arquivos
```
src/
├── db/
│   ├── schema.ts          # Schema Drizzle/SQLite
│   └── client.ts          # Cliente de banco
├── sync/
│   ├── pull.ts            # Sincronização servidor → local
│   ├── push.ts            # Sincronização local → servidor
│   └── schedule.ts        # Agendador de sync
├── stores/
│   └── authStore.ts       # Estado global de autenticação
├── services/
│   └── api.ts             # Cliente HTTP com interceptors
├── screens/
│   ├── LoginScreen.tsx    # Tela de login
│   ├── PatientsList.tsx   # Lista de pacientes
│   ├── PatientForm.tsx    # Formulário de paciente
│   ├── Appointments.tsx   # Lista de consultas
│   └── AppointmentForm.tsx # Formulário de consulta
└── components/
    └── SyncIndicator.tsx  # Indicador de sincronização
```

### Tecnologias Utilizadas
- **React Native/Expo**: Framework mobile
- **Drizzle ORM**: ORM para SQLite
- **Zustand**: Gerenciamento de estado
- **React Navigation**: Navegação
- **Axios**: Cliente HTTP
- **SecureStore**: Armazenamento seguro
- **TypeScript**: Tipagem estática

## Configuração e Instalação

### Pré-requisitos
- Node.js 18+
- pnpm
- Expo CLI
- API backend rodando

### Instalação
```bash
# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com as configurações da API

# Inicializar banco de dados
# (O banco é criado automaticamente na primeira execução)

# Executar o app
pnpm start
```

### Configuração da API
O app espera os seguintes endpoints na API:

#### Autenticação
- `POST /auth/login` - Login
- `GET /auth/me` - Verificar usuário atual

#### Pacientes
- `GET /pacientes?search=&page=&limit=&updatedAfter=` - Listar pacientes
- `POST /pacientes` - Criar paciente
- `PUT /pacientes/:id` - Atualizar paciente
- `DELETE /pacientes/:id` - Excluir paciente

#### Consultas
- `GET /consultas?from=&to=&status=&patientId=&updatedAfter=` - Listar consultas
- `POST /consultas` - Criar consulta
- `PUT /consultas/:id` - Atualizar consulta
- `DELETE /consultas/:id` - Excluir consulta

## Fluxo de Funcionamento

### 1. Autenticação
1. Usuário abre o app
2. Sistema verifica token salvo
3. Se válido: vai para tela principal
4. Se inválido: mostra tela de login
5. Após login bem-sucedido: inicializa banco e scheduler de sync

### 2. Operações Offline
1. Usuário cria/edita/exclui dados
2. Operação é salva localmente no SQLite
3. Operação é enfileirada no sync_outbox
4. Interface mostra indicador "Offline"
5. Dados ficam disponíveis imediatamente

### 3. Sincronização
1. **Automática**: App volta ao foreground, a cada 5min
2. **Manual**: Usuário clica em "Sync"
3. **Push**: Envia operações do outbox para servidor
4. **Pull**: Baixa dados atualizados do servidor
5. **Merge**: Aplica dados do servidor localmente
6. **Conflitos**: Servidor vence (last-write-wins)

### 4. Conflitos de Horário
1. Usuário tenta agendar consulta
2. Sistema verifica conflitos localmente
3. Se há conflito: mostra alerta com opção de continuar
4. Se não há conflito: salva normalmente
5. Após sync: servidor pode rejeitar (409 Conflict)
6. Sistema remove do outbox e aceita dados do servidor

## Validações Implementadas

### Pacientes
- Nome obrigatório (mínimo 2 caracteres)
- CPF com 11 dígitos (se informado)
- Email válido (se informado)

### Consultas
- Paciente obrigatório
- Data/hora início < data/hora fim
- Duração mínima 10 minutos
- Local obrigatório para consultas presenciais
- Verificação de conflitos de horário

## Estados da Interface

### Indicador de Sync
- **Verde**: Sincronizado
- **Azul**: Sincronizando
- **Vermelho**: Erro na sincronização
- **Texto**: Última sincronização

### Indicador Offline
- **Amarelo**: Dados criados offline
- **Texto**: "Offline"

### Loading States
- **Skeletons**: Carregamento de listas
- **Spinners**: Operações de salvamento
- **Empty States**: Quando não há dados

## Testes e Qualidade

### Funcionalidades Testadas
- ✅ Login/logout
- ✅ CRUD de pacientes offline
- ✅ CRUD de consultas offline
- ✅ Sincronização bidirecional
- ✅ Conflitos de horário
- ✅ Validações de formulário
- ✅ Estados de loading/error
- ✅ Navegação entre telas

### Cenários de Teste
1. **App offline**: Criar dados sem internet
2. **App online**: Sincronizar dados pendentes
3. **Conflitos**: Editar mesmo dado em dois dispositivos
4. **Token expirado**: Logout automático
5. **Erro de rede**: Retry com backoff exponencial

## Próximos Passos

### Melhorias Sugeridas
- [ ] Testes unitários com Jest
- [ ] Testes E2E com Detox
- [ ] Push notifications
- [ ] Backup automático
- [ ] Modo escuro
- [ ] Internacionalização
- [ ] Relatórios offline
- [ ] Upload de imagens

### Integrações Futuras
- [ ] Notificações push
- [ ] Calendário nativo
- [ ] Compartilhamento de dados
- [ ] Assinatura digital
- [ ] Integração com prontuário eletrônico

## Suporte

Para dúvidas ou problemas:
1. Verificar logs do console
2. Verificar status de sincronização
3. Verificar conectividade com API
4. Verificar dados no banco local

## Licença

Este projeto faz parte do sistema Prontuário Médico.
