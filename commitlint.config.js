module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat", // Nova funcionalidade
        "fix", // Correção de bug
        "docs", // Documentação
        "style", // Formatação (espaços, ponto e vírgula, etc.)
        "refactor", // Refatoração de código
        "test", // Adição ou correção de testes
        "chore", // Tarefas de build, dependências, etc.
        "perf", // Melhorias de performance
        "ci", // Mudanças em CI/CD
        "build", // Mudanças no sistema de build
        "revert", // Reverte um commit anterior
        "wip", // Work in progress
      ],
    ],
    "type-case": [2, "always", "lowerCase"],
    "type-empty": [2, "never"],
    "subject-case": [2, "always", "lowerCase"],
    "subject-empty": [2, "never"],
    "subject-full-stop": [2, "never", "."],
    "header-max-length": [2, "always", 72],
    "body-leading-blank": [2, "always"],
    "footer-leading-blank": [2, "always"],
  },
  prompt: {
    questions: {
      type: {
        description: "Selecione o tipo de mudança que você está fazendo:",
        enum: {
          feat: {
            description: "✨ Nova funcionalidade",
            title: "Features",
            emoji: "✨",
          },
          fix: {
            description: "🐛 Correção de bug",
            title: "Bug Fixes",
            emoji: "🐛",
          },
          docs: {
            description: "📚 Documentação",
            title: "Documentation",
            emoji: "📚",
          },
          style: {
            description: "💄 Formatação (espaços, ponto e vírgula, etc.)",
            title: "Styles",
            emoji: "💄",
          },
          refactor: {
            description: "♻️ Refatoração de código",
            title: "Code Refactoring",
            emoji: "♻️",
          },
          test: {
            description: "🚨 Adição ou correção de testes",
            title: "Tests",
            emoji: "🚨",
          },
          chore: {
            description: "🔧 Tarefas de build, dependências, etc.",
            title: "Chores",
            emoji: "🔧",
          },
          perf: {
            description: "⚡ Melhorias de performance",
            title: "Performance Improvements",
            emoji: "⚡",
          },
          ci: {
            description: "👷 Mudanças em CI/CD",
            title: "Continuous Integrations",
            emoji: "👷",
          },
          build: {
            description: "📦 Mudanças no sistema de build",
            title: "Builds",
            emoji: "📦",
          },
        },
      },
      scope: {
        description: "Indique o escopo desta mudança (opcional)",
      },
      subject: {
        description: "Escreva uma descrição curta e imperativa da mudança",
      },
      body: {
        description:
          "Forneça uma descrição mais detalhada da mudança (opcional)",
      },
      isBreaking: {
        description: "Há alguma mudança que quebra compatibilidade?",
      },
      breakingBody: {
        description: "Uma descrição das mudanças que quebram compatibilidade",
      },
      breaking: {
        description: "Descreva as mudanças que quebram compatibilidade",
      },
      isIssueAffected: {
        description: "Esta mudança afeta alguma issue aberta?",
      },
      issuesBody: {
        description:
          'Se as issues são fechadas, a convenção é: "Fixes #123, #456"',
      },
      issues: {
        description:
          'Adicione referências de issues (ex: "fix #123", "re #123")',
      },
    },
  },
};
