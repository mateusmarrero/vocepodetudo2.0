const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const NEW_VER = '4.60.0';

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
  const newEntry = `## [4.60.0] - ${today}
### Corrigido
- **Cabeçalho Desktop e Laptop (index.html):** Corrigido overflow horizontal no topo que empurrava botões ("Instalar App" e "Minha Área") para fora da tela em resoluções de 1024px a 1440px.
- **Hierarquia Visual:** Botões secundários ("Teste Vocacional", "Vagas & Estágios", "Blog & Dicas" e "Instalar App") ajustados para exibição apenas em telas amplas (2xl >= 1536px), permanecendo acessíveis diretamente nos dropdowns "Cursos & Trilhas" e "Carreira".
- **Acesso PWA Otimizado:** Adicionado atalho de instalação do app no dropdown "Minha Área" com acionamento seguro via JavaScript sem desalinhar o layout em notebooks e computadores.
- **Busca Desktop:** Largura máxima refinada para garantir folga de espaçamento em todos os tamanhos de monitor.

`;
  cl = cl.replace('# Changelog\n', '# Changelog\n\n' + newEntry);
  fs.writeFileSync(changelogPath, cl, 'utf8');
  console.log(`✅ CHANGELOG.md atualizado com as notas da v${NEW_VER}`);
}

console.log(`\n🎉 Concluído! ${updatedCount} arquivos HTML e Service Worker atualizados para v${NEW_VER}.`);
