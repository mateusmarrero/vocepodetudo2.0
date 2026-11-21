const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

const indexHtml = fs.readFileSync(path.join(baseDir, 'index.html'), 'utf-8');

// Achar os links de nível 1 dentro do nav
const navMatch = indexHtml.match(/<nav class="hidden lg:flex[\s\S]*?<\/nav>/i);
if (navMatch) {
  // Encontrar os botões/links filhos diretos
  console.log('--- FINAL DO NAV NO INDEX ---');
  const navContent = navMatch[0];
  const lastLinkIndex = navContent.lastIndexOf('</a>');
  console.log(navContent.slice(lastLinkIndex - 300, lastLinkIndex + 20));
}
