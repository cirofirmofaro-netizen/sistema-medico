# 🎨 Frontend Roadmap - Plantão Médico

## 🎯 **VISÃO GERAL**

Este documento detalha o roadmap para completar o frontend do módulo de plantões, incluindo as páginas faltantes e componentes complementares.

## 📊 **STATUS ATUAL**

### ✅ **IMPLEMENTADO (95%)**
- ✅ Página principal de plantões (`/plantoes`)
- ✅ Modal de criação de plantão avulso
- ✅ Modal de geração de ocorrências
- ✅ Modal de edição de plantão
- ✅ Lista de plantões com filtros
- ✅ Calendário de plantões
- ✅ Componentes de formulário
- ✅ Validações Zod
- ✅ Integração com API

### 🔄 **PENDENTE (5%)**
- [ ] Página de Fontes Pagadoras (`/fontes`)
- [ ] Página de Controle de IR (`/ir`)
- [ ] Componentes complementares

## 🚀 **ROADMAP DETALHADO**

### **1. PÁGINA DE FONTES PAGADORAS** 📋

#### **Arquivo**: `apps/web/src/pages/fontes/index.tsx`

#### **Funcionalidades**:
- [ ] Lista de fontes pagadoras com paginação
- [ ] Modal de criação/edição
- [ ] Filtros por nome, CNPJ, status
- [ ] Ações: editar, desativar, excluir
- [ ] Validação de CNPJ
- [ ] Formulário com campos:
  - Nome da instituição
  - CNPJ
  - Endereço
  - Telefone
  - Email
  - Valor por hora
  - Status (ativo/inativo)

#### **Componentes Necessários**:
```typescript
// apps/web/src/pages/fontes/index.tsx
// apps/web/src/pages/fontes/components/FontePagadoraModal.tsx
// apps/web/src/pages/fontes/components/FontePagadoraList.tsx
// apps/web/src/pages/fontes/components/FontePagadoraFilters.tsx
```

#### **API Endpoints**:
- `GET /fontes-pagadoras` - Listar
- `POST /fontes-pagadoras` - Criar
- `PUT /fontes-pagadoras/:id` - Atualizar
- `DELETE /fontes-pagadoras/:id` - Excluir

### **2. PÁGINA DE CONTROLE DE IR** 📊

#### **Arquivo**: `apps/web/src/pages/ir/index.tsx`

#### **Funcionalidades**:
- [ ] Visão geral anual de rendimentos
- [ ] Lista mensal de valores
- [ ] Upload de documentos
- [ ] Status de declaração
- [ ] Relatórios por período
- [ ] Export de dados
- [ ] Checklist de documentos

#### **Componentes Necessários**:
```typescript
// apps/web/src/pages/ir/index.tsx
// apps/web/src/pages/ir/components/IrOverview.tsx
// apps/web/src/pages/ir/components/IrMonthlyList.tsx
// apps/web/src/pages/ir/components/IrDocumentUpload.tsx
// apps/web/src/pages/ir/components/IrReport.tsx
```

#### **API Endpoints**:
- `GET /ir` - Listar por ano
- `POST /ir/:id/documentos` - Upload de documentos
- `GET /ir/relatorio` - Relatório anual

### **3. COMPONENTES COMPLEMENTARES** 🔧

#### **3.1 PagamentoModal**
```typescript
// apps/web/src/components/plantoes/PagamentoModal.tsx
interface PagamentoModalProps {
  plantao: Plantao;
  onClose: () => void;
  onSuccess: () => void;
}
```

**Funcionalidades**:
- [ ] Formulário de registro de pagamento
- [ ] Validação de valores
- [ ] Seleção de data de pagamento
- [ ] Campo de observações
- [ ] Status de pagamento

#### **3.2 TrocaModal**
```typescript
// apps/web/src/components/plantoes/TrocaModal.tsx
interface TrocaModalProps {
  plantao: Plantao;
  onClose: () => void;
  onSuccess: () => void;
}
```

**Funcionalidades**:
- [ ] Seleção de plantão para troca
- [ ] Validação de compatibilidade
- [ ] Confirmação de troca
- [ ] Notificação de aprovação

#### **3.3 PdfPreview**
```typescript
// apps/web/src/components/shared/PdfPreview.tsx
interface PdfPreviewProps {
  url: string;
  onClose: () => void;
}
```

**Funcionalidades**:
- [ ] Preview de PDFs
- [ ] Zoom in/out
- [ ] Download
- [ ] Responsivo

## 📁 **ESTRUTURA DE ARQUIVOS**

```
apps/web/src/
├── pages/
│   ├── fontes/
│   │   ├── index.tsx
│   │   └── components/
│   │       ├── FontePagadoraModal.tsx
│   │       ├── FontePagadoraList.tsx
│   │       └── FontePagadoraFilters.tsx
│   └── ir/
│       ├── index.tsx
│       └── components/
│           ├── IrOverview.tsx
│           ├── IrMonthlyList.tsx
│           ├── IrDocumentUpload.tsx
│           └── IrReport.tsx
├── components/
│   ├── plantoes/
│   │   ├── PagamentoModal.tsx
│   │   └── TrocaModal.tsx
│   └── shared/
│       └── PdfPreview.tsx
└── services/
    ├── fontesPagadoras.ts
    └── ir.ts
```

## 🎨 **DESIGN SYSTEM**

### **Cores**:
```css
--primary: #2563eb;
--secondary: #64748b;
--success: #16a34a;
--warning: #ca8a04;
--error: #dc2626;
--background: #f8fafc;
--surface: #ffffff;
```

### **Componentes Base**:
- Button (variants: primary, secondary, outline, ghost)
- Input (text, number, select, date)
- Modal (base, confirm, form)
- Table (sortable, paginated, filters)
- Card (default, elevated, interactive)

### **Layout**:
- Header com navegação
- Sidebar com menu
- Main content area
- Responsive design (mobile-first)

## 🔧 **IMPLEMENTAÇÃO**

### **1. Configuração de Rotas**
```typescript
// apps/web/src/App.tsx
<Route path="/fontes" element={<FontesPagadorasPage />} />
<Route path="/ir" element={<IrPage />} />
```

### **2. Navegação**
```typescript
// apps/web/src/components/layout/Sidebar.tsx
{
  name: 'Fontes Pagadoras',
  href: '/fontes',
  icon: BuildingOfficeIcon
},
{
  name: 'Controle IR',
  href: '/ir',
  icon: DocumentTextIcon
}
```

### **3. Serviços de API**
```typescript
// apps/web/src/services/fontesPagadoras.ts
export const fontesPagadorasService = {
  list: (params) => api.get('/fontes-pagadoras', { params }),
  create: (data) => api.post('/fontes-pagadoras', data),
  update: (id, data) => api.put(`/fontes-pagadoras/${id}`, data),
  delete: (id) => api.delete(`/fontes-pagadoras/${id}`)
};

// apps/web/src/services/ir.ts
export const irService = {
  list: (ano) => api.get('/ir', { params: { ano } }),
  uploadDocument: (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/ir/${id}/documentos`, formData);
  }
};
```

## 🧪 **TESTES**

### **Testes Unitários**:
```typescript
// apps/web/src/pages/fontes/__tests__/index.test.tsx
// apps/web/src/pages/ir/__tests__/index.test.tsx
// apps/web/src/components/plantoes/__tests__/PagamentoModal.test.tsx
```

### **Testes de Integração**:
```typescript
// apps/web/src/__tests__/integration/fontes.test.tsx
// apps/web/src/__tests__/integration/ir.test.tsx
```

## 📋 **CHECKLIST DE IMPLEMENTAÇÃO**

### **Fase 1: Fontes Pagadoras**
- [ ] Criar estrutura de pastas
- [ ] Implementar página principal
- [ ] Criar componentes de lista e filtros
- [ ] Implementar modal de criação/edição
- [ ] Adicionar validações
- [ ] Testar integração com API
- [ ] Adicionar testes

### **Fase 2: Controle de IR**
- [ ] Criar estrutura de pastas
- [ ] Implementar visão geral anual
- [ ] Criar lista mensal
- [ ] Implementar upload de documentos
- [ ] Adicionar relatórios
- [ ] Testar funcionalidades
- [ ] Adicionar testes

### **Fase 3: Componentes Complementares**
- [ ] Implementar PagamentoModal
- [ ] Implementar TrocaModal
- [ ] Implementar PdfPreview
- [ ] Integrar com páginas existentes
- [ ] Testar componentes
- [ ] Documentar uso

### **Fase 4: Finalização**
- [ ] Revisar navegação
- [ ] Testar responsividade
- [ ] Otimizar performance
- [ ] Revisar acessibilidade
- [ ] Documentar funcionalidades
- [ ] Deploy de teste

## 🎯 **CRITÉRIOS DE ACEITAÇÃO**

### **Fontes Pagadoras**:
- ✅ Lista todas as fontes pagadoras do usuário
- ✅ Permite criar nova fonte pagadora
- ✅ Permite editar fonte existente
- ✅ Valida CNPJ corretamente
- ✅ Aplica isolamento single-tenant
- ✅ Interface responsiva

### **Controle de IR**:
- ✅ Exibe visão geral anual
- ✅ Lista valores mensais
- ✅ Permite upload de documentos
- ✅ Gera relatórios
- ✅ Interface intuitiva
- ✅ Dados isolados por usuário

### **Componentes**:
- ✅ PagamentoModal funcional
- ✅ TrocaModal funcional
- ✅ PdfPreview funcional
- ✅ Integração com páginas existentes
- ✅ Validações adequadas

## 🚀 **PRÓXIMOS PASSOS**

1. **Implementar Página de Fontes Pagadoras**
   - Criar estrutura de arquivos
   - Implementar componentes básicos
   - Integrar com API

2. **Implementar Página de Controle de IR**
   - Criar layout da página
   - Implementar funcionalidades
   - Adicionar upload de documentos

3. **Criar Componentes Complementares**
   - PagamentoModal
   - TrocaModal
   - PdfPreview

4. **Testes e Validação**
   - Testes unitários
   - Testes de integração
   - Validação de funcionalidades

---

*Última atualização: Dezembro 2024*
*Status: Em desenvolvimento*
*Próxima revisão: Após implementação das páginas*
