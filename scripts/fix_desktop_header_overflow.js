const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const indexPath = path.join(ROOT_DIR, 'index.html');
const appJsPath = path.join(ROOT_DIR, 'src', 'app.js');

console.log('--- Iniciando Correção de Overflow do Cabeçalho Desktop (com Regex flexível) ---');

// 1. Atualizar index.html
let indexContent = fs.readFileSync(indexPath, 'utf8');

// Ajuste da busca
indexContent = indexContent.replace(
  /class="hidden xl:flex flex-1 max-w-\[200px\] xl:max-w-\[240px\] relative"/g,
  'class="hidden xl:flex flex-1 max-w-[170px] 2xl:max-w-[220px] relative"'
);

// nav-btn-career-quiz: mudar hidden sm:inline-flex para hidden 2xl:inline-flex
indexContent = indexContent.replace(
  /(id="nav-btn-career-quiz"[\r\n\s]+class=")hidden sm:inline-flex/g,
  '$1hidden 2xl:inline-flex'
);

// nav-btn-jobs: mudar hidden md:inline-flex para hidden 2xl:inline-flex
indexContent = indexContent.replace(
  /(id="nav-btn-jobs"[\r\n\s]+class=")hidden md:inline-flex/g,
  '$1hidden 2xl:inline-flex'
);

// nav-btn-blog: mudar hidden xl:inline-flex para hidden 2xl:inline-flex
indexContent = indexContent.replace(
  /(id="nav-btn-blog"[\r\n\s]+class=")hidden xl:inline-flex/g,
  '$1hidden 2xl:inline-flex'
);

// btn-install-pwa-desktop: mudar hidden para hidden 2xl:inline-flex
indexContent = indexContent.replace(
  /(id="btn-install-pwa-desktop"[\r\n\s]+class=")hidden items-center/g,
  '$1hidden 2xl:inline-flex items-center'
);

fs.writeFileSync(indexPath, indexContent, 'utf8');
console.log('✅ index.html atualizado.');

// Verificar o resultado
const updatedIndex = fs.readFileSync(indexPath, 'utf8');
const checks = [
  'nav-btn-career-quiz',
  'nav-btn-jobs',
  'nav-btn-blog',
  'btn-install-pwa-desktop'
];

for (const id of checks) {
  const match = updatedIndex.match(new RegExp(`id="${id}"[\\s\\S]*?class="([^"]+)"`));
  if (match) {
    console.log(`[${id}] class: ${match[1]}`);
  }
}
