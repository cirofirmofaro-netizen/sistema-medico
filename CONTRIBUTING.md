# 🤝 Guia de Contribuição

Obrigado por contribuir com o Sistema Plantão Médico! Este documento contém as diretrizes para contribuições.

## 🌿 Fluxo de Branches

### Branches Principais

- `main`: Produção (sempre estável)
- `develop`: Desenvolvimento (integração de features)

### Branches de Trabalho

- `feature/*`: Novas funcionalidades
- `fix/*`: Correções de bugs
- `hotfix/*`: Correções urgentes para produção
- `release/*`: Preparação de releases

### Convenções de Nomenclatura

```bash
feature/add-payment-modal
fix/plantao-midnight-validation
hotfix/critical-auth-bug
release/v1.2.0
```

## 📝 Conventional Commits

Seguimos o padrão [Conventional Commits](https://www.conventionalcommits.org/):

### Tipos de Commit

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação (espaços, ponto e vírgula, etc.)
- `refactor`: Refatoração de código
- `test`: Adição ou correção de testes
- `chore`: Tarefas de build, dependências, etc.
- `perf`: Melhorias de performance
- `ci`: Mudanças em CI/CD
- `build`: Mudanças no sistema de build

### Estrutura

```
<tipo>(<escopo>): <descrição>

[corpo opcional]

[rodapé opcional]
```

### Exemplos

```bash
feat(plantoes): adiciona modal de pagamento
fix(auth): corrige validação de token expirado
docs(readme): atualiza instruções de instalação
refactor(api): simplifica lógica de plantões
test(plantoes): adiciona testes para validação noturna
```

## 🔄 Fluxo de Desenvolvimento

### 1. Preparação

```bash
# Certifique-se de estar na branch develop
git checkout develop
git pull origin develop

# Crie sua branch de trabalho
git checkout -b feature/sua-feature
```

### 2. Desenvolvimento

- Desenvolva sua funcionalidade
- Faça commits frequentes seguindo Conventional Commits
- Mantenha commits pequenos e focados

### 3. Testes

```bash
# Execute testes
pnpm test

# Verifique linting
pnpm lint

# Formate código
pnpm format
```

### 4. Pull Request

- Abra PR para `develop`
- Use o template de PR
- Preencha o checklist
- Aguarde review

## 📋 Checklist de Pull Request

### ✅ Antes de Abrir o PR

- [ ] Código segue padrões do projeto
- [ ] Testes passando (`pnpm test`)
- [ ] Lint sem erros (`pnpm lint`)
- [ ] Código formatado (`pnpm format`)
- [ ] Commits seguem Conventional Commits
- [ ] Documentação atualizada (se necessário)
- [ ] Migrações de banco aplicadas (se houver)

### ✅ Durante o Review

- [ ] Build passando no CI
- [ ] Coverage mínimo mantido (80%)
- [ ] Funcionalidade testada manualmente
- [ ] Sem conflitos de merge
- [ ] Aprovado por pelo menos 1 reviewer

### ✅ Antes do Merge

- [ ] Todos os comentários resolvidos
- [ ] Commits organizados (squash se necessário)
- [ ] Branch atualizada com develop

## 🧪 Testes

### Cobertura Mínima

- **Backend**: 80%
- **Frontend**: 70%
- **Mobile**: 60%

### Tipos de Teste

- **Unitários**: Funções e componentes isolados
- **Integração**: APIs e fluxos de dados
- **E2E**: Fluxos completos do usuário

### Executar Testes

```bash
# Todos os testes
pnpm test

# Testes com coverage
pnpm test:cov

# Testes em modo watch
pnpm test:watch

# Testes E2E
pnpm test:e2e
```

## 🔍 Code Review

### O que Verificar

- [ ] Lógica de negócio correta
- [ ] Tratamento de erros adequado
- [ ] Performance aceitável
- [ ] Segurança (validações, sanitização)
- [ ] Acessibilidade (frontend)
- [ ] Compatibilidade com versões anteriores

### Comentários

- Seja construtivo e específico
- Sugira alternativas quando possível
- Use emojis para facilitar comunicação
- Marque como "resolvido" quando o problema for corrigido

## 🚀 Release

### Processo de Release

1. Branch `release/vX.Y.Z` criada a partir de `develop`
2. Versionamento atualizado
3. CHANGELOG.md atualizado
4. Testes finais executados
5. Merge para `main` e `develop`
6. Tag criada automaticamente
7. Deploy para produção

### Versionamento Semântico

- **MAJOR** (X.0.0): Mudanças incompatíveis
- **MINOR** (0.X.0): Novas funcionalidades
- **PATCH** (0.0.X): Correções de bugs

## 🐛 Reportando Bugs

### Template de Bug Report

```markdown
**Descrição do Bug**
Descrição clara e concisa do problema.

**Passos para Reproduzir**

1. Vá para '...'
2. Clique em '...'
3. Role até '...'
4. Veja o erro

**Comportamento Esperado**
O que deveria acontecer.

**Comportamento Atual**
O que está acontecendo.

**Screenshots**
Se aplicável.

**Ambiente**

- OS: [ex: Windows 10]
- Browser: [ex: Chrome 91]
- Versão: [ex: v1.2.0]

**Contexto Adicional**
Qualquer informação adicional.
```

## 💡 Sugerindo Features

### Template de Feature Request

```markdown
**Problema**
Descrição do problema que a feature resolveria.

**Solução Proposta**
Descrição da solução desejada.

**Alternativas Consideradas**
Outras soluções que foram consideradas.

**Contexto Adicional**
Qualquer informação adicional.
```

## 📞 Suporte

- **Issues**: Use GitHub Issues
- **Discussions**: Use GitHub Discussions
- **Email**: cirofirmofaro@gmail.com

## 📄 Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob os mesmos termos do projeto.

---

**Obrigado por contribuir!** 🎉
