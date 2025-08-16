# 🔌 API Endpoints - Plantão Médico

## 🎯 **VISÃO GERAL**

Documentação completa dos endpoints da API NestJS. Todos os endpoints requerem autenticação JWT e aplicam isolamento single-tenant automaticamente.

## 🔐 **AUTENTICAÇÃO**

### **POST /auth/login**
```typescript
// Request
{
  "email": "joao@exemplo.com",
  "senha": "123456"
}

// Response
{
  "access_token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "joao@exemplo.com",
    "nome": "João Silva"
  }
}
```

### **POST /auth/register**
```typescript
// Request
{
  "email": "novo@exemplo.com",
  "senha": "123456",
  "nome": "Novo Usuário"
}

// Response
{
  "access_token": "jwt_token_here",
  "user": {
    "id": 3,
    "email": "novo@exemplo.com",
    "nome": "Novo Usuário"
  }
}
```

## 👥 **PACIENTES**

### **GET /pacientes**
```typescript
// Query Parameters
{
  "page": 1,
  "limit": 10,
  "search": "joão",
  "sortBy": "nome",
  "sortOrder": "asc"
}

// Response
{
  "data": [
    {
      "id": 1,
      "nome": "João Silva",
      "dataNascimento": "1990-01-01",
      "cpf": "123.456.789-00",
      "telefone": "(11) 99999-9999",
      "email": "joao@email.com",
      "endereco": "Rua A, 123",
      "createdAt": "2024-12-01T10:00:00Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

### **POST /pacientes**
```typescript
// Request
{
  "nome": "Maria Santos",
  "dataNascimento": "1985-05-15",
  "cpf": "987.654.321-00",
  "telefone": "(11) 88888-8888",
  "email": "maria@email.com",
  "endereco": "Rua B, 456"
}

// Response
{
  "id": 2,
  "nome": "Maria Santos",
  "dataNascimento": "1985-05-15",
  "cpf": "987.654.321-00",
  "telefone": "(11) 88888-8888",
  "email": "maria@email.com",
  "endereco": "Rua B, 456",
  "usuarioId": 1,
  "createdAt": "2024-12-01T10:00:00Z"
}
```

### **GET /pacientes/:id**
```typescript
// Response
{
  "id": 1,
  "nome": "João Silva",
  "dataNascimento": "1990-01-01",
  "cpf": "123.456.789-00",
  "telefone": "(11) 99999-9999",
  "email": "joao@email.com",
  "endereco": "Rua A, 123",
  "evolucoes": [...],
  "atendimentos": [...],
  "alergias": [...],
  "medicamentos": [...]
}
```

### **PUT /pacientes/:id**
```typescript
// Request (mesmo formato do POST)
// Response (paciente atualizado)
```

### **DELETE /pacientes/:id**
```typescript
// Response
{
  "message": "Paciente removido com sucesso"
}
```

## 📋 **PRONTUÁRIO**

### **GET /prontuario/:pacienteId/evolucoes**
```typescript
// Response
{
  "data": [
    {
      "id": 1,
      "conteudo": "Paciente apresenta...",
      "tipo": "EVOLUCAO",
      "versao": 1,
      "assinado": true,
      "assinatura": "base64_signature",
      "createdAt": "2024-12-01T10:00:00Z"
    }
  ]
}
```

### **POST /prontuario/:pacienteId/evolucoes**
```typescript
// Request
{
  "conteudo": "Nova evolução médica...",
  "tipo": "EVOLUCAO"
}

// Response
{
  "id": 2,
  "conteudo": "Nova evolução médica...",
  "tipo": "EVOLUCAO",
  "versao": 1,
  "assinado": false,
  "createdAt": "2024-12-01T10:00:00Z"
}
```

### **POST /prontuario/:pacienteId/evolucoes/:id/assinar**
```typescript
// Request
{
  "assinatura": "base64_signature"
}

// Response
{
  "id": 2,
  "assinado": true,
  "assinatura": "base64_signature",
  "assinadoEm": "2024-12-01T10:00:00Z"
}
```

## 🏥 **ATENDIMENTOS**

### **GET /atendimentos**
```typescript
// Query Parameters
{
  "page": 1,
  "limit": 10,
  "status": "ATIVO",
  "pacienteId": 1
}

// Response
{
  "data": [
    {
      "id": 1,
      "pacienteId": 1,
      "paciente": {
        "id": 1,
        "nome": "João Silva"
      },
      "status": "ATIVO",
      "inicio": "2024-12-01T10:00:00Z",
      "fim": null,
      "createdAt": "2024-12-01T10:00:00Z"
    }
  ]
}
```

### **POST /atendimentos**
```typescript
// Request
{
  "pacienteId": 1
}

// Response
{
  "id": 1,
  "pacienteId": 1,
  "status": "ATIVO",
  "inicio": "2024-12-01T10:00:00Z",
  "fim": null,
  "createdAt": "2024-12-01T10:00:00Z"
}
```

### **PUT /atendimentos/:id/finalizar**
```typescript
// Response
{
  "id": 1,
  "status": "FINALIZADO",
  "fim": "2024-12-01T11:00:00Z"
}
```

## 📎 **ANEXOS**

### **POST /anexos/upload**
```typescript
// Request (multipart/form-data)
{
  "file": File,
  "tipo": "DOCUMENTO",
  "descricao": "Exame de sangue"
}

// Response
{
  "id": 1,
  "nome": "exame.pdf",
  "tipo": "DOCUMENTO",
  "descricao": "Exame de sangue",
  "tamanho": 1024000,
  "url": "presigned_url_here",
  "status": "TEMPORARIO",
  "createdAt": "2024-12-01T10:00:00Z"
}
```

### **POST /anexos/:id/commit**
```typescript
// Response
{
  "id": 1,
  "status": "PERMANENTE",
  "url": "permanent_url_here"
}
```

### **DELETE /anexos/:id**
```typescript
// Response
{
  "message": "Anexo removido com sucesso"
}
```

## 💰 **FONTES PAGADORAS**

### **GET /fontes-pagadoras**
```typescript
// Response
{
  "data": [
    {
      "id": 1,
      "nome": "Hospital ABC",
      "cnpj": "12.345.678/0001-90",
      "endereco": "Rua Hospital, 123",
      "telefone": "(11) 3333-3333",
      "email": "contato@hospitalabc.com",
      "valorHora": 150.00,
      "ativo": true,
      "createdAt": "2024-12-01T10:00:00Z"
    }
  ]
}
```

### **POST /fontes-pagadoras**
```typescript
// Request
{
  "nome": "Hospital XYZ",
  "cnpj": "98.765.432/0001-10",
  "endereco": "Rua Nova, 456",
  "telefone": "(11) 4444-4444",
  "email": "contato@hospitalxyz.com",
  "valorHora": 180.00
}

// Response
{
  "id": 2,
  "nome": "Hospital XYZ",
  "cnpj": "98.765.432/0001-10",
  "endereco": "Rua Nova, 456",
  "telefone": "(11) 4444-4444",
  "email": "contato@hospitalxyz.com",
  "valorHora": 180.00,
  "ativo": true,
  "createdAt": "2024-12-01T10:00:00Z"
}
```

## 🏥 **PLANTÕES**

### **GET /plantoes**
```typescript
// Query Parameters
{
  "page": 1,
  "limit": 10,
  "dataInicio": "2024-12-01",
  "dataFim": "2024-12-31",
  "fontePagadoraId": 1,
  "status": "CONFIRMADO"
}

// Response
{
  "data": [
    {
      "id": 1,
      "fontePagadoraId": 1,
      "fontePagadora": {
        "id": 1,
        "nome": "Hospital ABC"
      },
      "data": "2024-12-01",
      "inicio": "19:00",
      "fim": "07:00",
      "valorHora": 150.00,
      "valorTotal": 1800.00,
      "status": "CONFIRMADO",
      "observacoes": "Plantão noturno",
      "createdAt": "2024-12-01T10:00:00Z"
    }
  ]
}
```

### **POST /plantoes**
```typescript
// Request
{
  "fontePagadoraId": 1,
  "data": "2024-12-01",
  "inicio": "19:00",
  "fim": "07:00",
  "valorHora": 150.00,
  "observacoes": "Plantão noturno"
}

// Response
{
  "id": 1,
  "fontePagadoraId": 1,
  "data": "2024-12-01",
  "inicio": "19:00",
  "fim": "07:00",
  "valorHora": 150.00,
  "valorTotal": 1800.00,
  "status": "PENDENTE",
  "observacoes": "Plantão noturno",
  "createdAt": "2024-12-01T10:00:00Z"
}
```

### **POST /plantoes/gerar-ocorrencias**
```typescript
// Request
{
  "modeloId": 1,
  "dataInicio": "2024-12-01",
  "dataFim": "2024-12-31"
}

// Response
{
  "message": "15 plantões gerados com sucesso",
  "count": 15
}
```

## 💳 **PAGAMENTOS**

### **GET /pagamentos**
```typescript
// Query Parameters
{
  "page": 1,
  "limit": 10,
  "dataInicio": "2024-12-01",
  "dataFim": "2024-12-31",
  "status": "PAGO"
}

// Response
{
  "data": [
    {
      "id": 1,
      "plantaoId": 1,
      "plantao": {
        "id": 1,
        "data": "2024-12-01",
        "fontePagadora": {
          "nome": "Hospital ABC"
        }
      },
      "valor": 1800.00,
      "dataPagamento": "2024-12-15",
      "status": "PAGO",
      "observacoes": "Pago via PIX",
      "createdAt": "2024-12-01T10:00:00Z"
    }
  ]
}
```

### **POST /pagamentos**
```typescript
// Request
{
  "plantaoId": 1,
  "valor": 1800.00,
  "dataPagamento": "2024-12-15",
  "observacoes": "Pago via PIX"
}

// Response
{
  "id": 1,
  "plantaoId": 1,
  "valor": 1800.00,
  "dataPagamento": "2024-12-15",
  "status": "PAGO",
  "observacoes": "Pago via PIX",
  "createdAt": "2024-12-01T10:00:00Z"
}
```

## 📊 **IR (INFORME DE RENDIMENTO)**

### **GET /ir**
```typescript
// Query Parameters
{
  "ano": 2024
}

// Response
{
  "data": [
    {
      "id": 1,
      "ano": 2024,
      "mes": 12,
      "valorTotal": 15000.00,
      "status": "PENDENTE",
      "documentos": [
        {
          "id": 1,
          "nome": "recibo.pdf",
          "url": "url_here"
        }
      ],
      "createdAt": "2024-12-01T10:00:00Z"
    }
  ]
}
```

### **POST /ir/:id/documentos**
```typescript
// Request (multipart/form-data)
{
  "file": File,
  "tipo": "RECIBO"
}

// Response
{
  "id": 2,
  "nome": "novo_recibo.pdf",
  "tipo": "RECIBO",
  "url": "url_here",
  "createdAt": "2024-12-01T10:00:00Z"
}
```

## 📈 **RELATÓRIOS**

### **GET /relatorios/plantoes/export**
```typescript
// Query Parameters
{
  "dataInicio": "2024-12-01",
  "dataFim": "2024-12-31",
  "fontePagadoraId": 1,
  "format": "csv"
}

// Response
// CSV file download
```

## 🔧 **UTILITÁRIOS**

### **GET /shared/modelos-plantao**
```typescript
// Response
{
  "data": [
    {
      "id": 1,
      "nome": "Plantão Noturno",
      "fontePagadoraId": 1,
      "inicioPadrao": "19:00",
      "fimPadrao": "07:00",
      "valorHora": 150.00,
      "diasSemana": ["SEGUNDA", "TERCA", "QUARTA", "QUINTA", "SEXTA"],
      "ativo": true,
      "createdAt": "2024-12-01T10:00:00Z"
    }
  ]
}
```

### **GET /shared/condicoes**
```typescript
// Response
{
  "data": [
    {
      "id": 1,
      "nome": "Hipertensão",
      "categoria": "CARDIOVASCULAR"
    }
  ]
}
```

### **GET /shared/medicamentos**
```typescript
// Response
{
  "data": [
    {
      "id": 1,
      "nome": "AAS",
      "categoria": "ANTIAGREGANTE"
    }
  ]
}
```

## ⚠️ **CÓDIGOS DE ERRO**

### **400 - Bad Request**
```typescript
{
  "statusCode": 400,
  "message": ["Erro de validação"],
  "error": "Bad Request"
}
```

### **401 - Unauthorized**
```typescript
{
  "statusCode": 401,
  "message": "Token inválido ou expirado",
  "error": "Unauthorized"
}
```

### **403 - Forbidden**
```typescript
{
  "statusCode": 403,
  "message": "Acesso negado",
  "error": "Forbidden"
}
```

### **404 - Not Found**
```typescript
{
  "statusCode": 404,
  "message": "Recurso não encontrado",
  "error": "Not Found"
}
```

### **500 - Internal Server Error**
```typescript
{
  "statusCode": 500,
  "message": "Erro interno do servidor",
  "error": "Internal Server Error"
}
```

## 🔒 **SEGURANÇA**

### **Headers Obrigatórios**
```typescript
{
  "Authorization": "Bearer jwt_token_here",
  "Content-Type": "application/json"
}
```

### **Isolamento Single-Tenant**
- Todos os endpoints aplicam automaticamente filtros por `usuarioId`
- Dados são isolados por usuário autenticado
- Tentativas de acesso a dados de outros usuários retornam 404

### **Rate Limiting**
- 100 requests por minuto por IP
- 1000 requests por hora por usuário

---

*Última atualização: Dezembro 2024*
*Versão da API: 1.0.0*
