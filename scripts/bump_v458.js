const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const NEW_VER = '4.58.0';

const files = fs.readdirSync(ROOT_DIR).filter(f => f.endsWith('.html'));

let updatedCount = 0;
for (const file of files) {
  const filePath = path.join(ROOT_DIR, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Substituir ?v=x.y.z por ?v=4.58.0
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

console.log(`\n🎉 Concluído! ${updatedCount} arquivos HTML atualizados com cache-busting v=${NEW_VER}.`);
