module.exports = {
  // Executar em todos os arquivos TypeScript/JavaScript
  "*.{js,jsx,ts,tsx}": ["prettier --write"],

  // Executar em arquivos de configuração
  "*.{json,md,yml,yaml}": ["prettier --write"],

  // Executar em arquivos CSS/SCSS
  "*.{css,scss}": ["prettier --write"],

  // Executar em arquivos HTML
  "*.html": ["prettier --write"],
};
