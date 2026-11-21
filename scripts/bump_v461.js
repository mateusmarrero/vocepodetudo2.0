const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const NEW_VER = '4.61.0';

console.log(`--- Iniciando Bump de Versão para v${NEW_VER} ---`);

const files = fs.readdirSync(ROOT_DIR).filter(f => f.endsWith('.html'));

let updatedCount = 0;
for (const file of files) {
  const filePath = path.join(ROOT_DIR, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  content = content.replace(/\?v=\d+\.\d+\.\d+/g, `?v=${NEW_VER}`);

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    updatedCount++;
    console.log(`✅ Cache busting atualizado para v=${NEW_VER} em: ${file}`);
  }
}

// Atualizar sw.js
const swPath = path.join(ROOT_DIR, 'sw.js');
if (fs.existsSync(swPath)) {
  let sw = fs.readFileSync(swPath, 'utf8');
  sw = sw.replace(/const CACHE_NAME = 'vocepodetudo-pwa-v\d+\.\d+\.\d+';/, `const CACHE_NAME = 'vocepodetudo-pwa-v${NEW_VER}';`);
  fs.writeFileSync(swPath, sw, 'utf8');
  console.log(`✅ Service Worker CACHE_NAME atualizado para v=${NEW_VER}`);
}

// Atualizar CHANGELOG.md
const changelogPath = path.join(ROOT_DIR, 'CHANGELOG.md');
if (fs.existsSync(changelogPath)) {
  let cl = fs.readFileSync(changelogPath, 'utf8');
  const today = new Date().toISOString().split('T')[0];
  const newEntry = `## [4.61.0] - ${today}
### Corrigido
- **Menus Dropdown Cascata (index.html, blog.html, vagas.html, curriculo.html):** Removido \`overflow-hidden\` da tag \`<header>\` que impedia visualmente os menus suspensos de descerem e serem renderizados abaixo do cabeçalho.
- **Suporte Nativo a Hover:** Adicionada regra CSS pura \`@media (hover: hover)\` em \`src/style.css\` para abertura instantânea dos dropdowns de "Cursos & Trilhas", "Carreira" e "Minha Área" ao passar o mouse.
- **Estabilidade de Clique e Foco:** Refinada a função \`setupCascadingMenus()\` em \`src/app.js\` com proteção \`justOpenedByHover\` para que o clique do usuário não feche o menu acidentalmente após o disparo do mouseenter.

`;
  cl = cl.replace('# Changelog\n', '# Changelog\n\n' + newEntry);
  fs.writeFileSync(changelogPath, cl, 'utf8');
  console.log(`✅ CHANGELOG.md atualizado com as notas da v${NEW_VER}`);
}

console.log(`\n🎉 Concluído! ${updatedCount} arquivos HTML e Service Worker atualizados para v${NEW_VER}.`);
