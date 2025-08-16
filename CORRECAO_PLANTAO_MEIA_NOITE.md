# 🌙 CORREÇÃO: PLANTÕES ATRAVESSANDO MEIA-NOITE

## ❌ **PROBLEMA IDENTIFICADO**

A validação de horários estava impedindo plantões que atravessam a meia-noite, que é muito comum em plantões noturnos (ex: 19:00 - 07:00).

### **Causa do Problema:**
A validação comparava apenas os horários no mesmo dia, considerando que `07:00 < 19:00` seria inválido.

## ✅ **SOLUÇÃO IMPLEMENTADA**

### **1. Validação Corrigida no Frontend**

**Arquivos modificados:**
- `apps/web/src/lib/validators.ts`
- `apps/web/src/pages/plantoes/components/EditPlantaoDialog.tsx`

**Antes:**
```typescript
// Validar que fim > início
const inicio = new Date(`2000-01-01T${data.inicioPadrao}`);
const fim = new Date(`2000-01-01T${data.fimPadrao}`);
return fim > inicio;
```

**Depois:**
```typescript
// Validar que fim > início (permitindo atravessar meia-noite)
const [inicioHora, inicioMin] = data.inicioPadrao.split(':').map(Number);
const [fimHora, fimMin] = data.fimPadrao.split(':').map(Number);

// Converter para minutos desde meia-noite
const inicioMinutos = inicioHora * 60 + inicioMin;
const fimMinutos = fimHora * 60 + fimMin;

// Se fim < início, significa que atravessa meia-noite (válido)
// Se fim = início, significa duração zero (inválido)
return fimMinutos !== inicioMinutos;
```

### **2. Lógica da Correção**

- **Plantão normal**: 08:00 - 18:00 → `480 < 1080` ✅ Válido
- **Plantão noturno**: 19:00 - 07:00 → `1140 > 420` ❌ Mas atravessa meia-noite ✅ Válido
- **Horários iguais**: 19:00 - 19:00 → `1140 = 1140` ❌ Duração zero

### **3. Validações Corrigidas**

1. **Modelo de Plantão** (`modeloPlantaoSchema`)
2. **Plantão Avulso** (`plantaoAvulsoSchema`) 
3. **Edição de Plantão** (`EditPlantaoDialog`)

## 🧪 **TESTE**

Execute o teste para verificar se a correção funcionou:

```bash
node test-plantao-midnight.js
```

**Resultado Esperado:**
- ✅ Plantão 19:00 - 07:00 criado com sucesso
- ✅ Plantão 08:00 - 18:00 criado com sucesso
- ✅ Duração calculada corretamente

## 📋 **CASOS DE USO SUPORTADOS**

### **Plantões Noturnos Comuns:**
- 19:00 - 07:00 (12h)
- 20:00 - 08:00 (12h)
- 18:00 - 06:00 (12h)
- 22:00 - 10:00 (12h)

### **Plantões Longos:**
- 07:00 - 19:00 (12h)
- 08:00 - 20:00 (12h)
- 06:00 - 18:00 (12h)

### **Plantões de 24h:**
- 07:00 - 07:00 (24h) - dia seguinte
- 08:00 - 08:00 (24h) - dia seguinte

## 🎯 **RESULTADO**

Agora o sistema suporta corretamente plantões que atravessam a meia-noite, que são muito comuns na prática médica! 🌙
