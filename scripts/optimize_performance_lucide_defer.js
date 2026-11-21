const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const NEW_VER = '4.56.0';
const htmlFiles = fs.readdirSync(ROOT_DIR).filter(f => f.endsWith('.html'));

let optimizedLucideCount = 0;
let optimizedImgCount = 0;

for (const file of htmlFiles) {
  const filePath = path.join(ROOT_DIR, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // 1. Otimizar Lucide Icons adicionando defer (elimina render-blocking)
  const syncLucide = '<script src="https://unpkg.com/lucide@0.344.0/dist/umd/lucide.min.js"></script>';
  const deferLucide = '<script defer src="https://unpkg.com/lucide@0.344.0/dist/umd/lucide.min.js"></script>';
  if (content.includes(syncLucide)) {
    content = content.replace(syncLucide, deferLucide);
    optimizedLucideCount++;
  }

  // 2. Bump de versão de cache
  content = content.replace(/\?v=\d+\.\d+\.\d+/g, `?v=${NEW_VER}`);

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

// 3. Atualizar sw.js
const swPath = path.join(ROOT_DIR, 'sw.js');
if (fs.existsSync(swPath)) {
  let sw = fs.readFileSync(swPath, 'utf8');
  sw = sw.replace(/const CACHE_NAME = 'vocepodetudo-pwa-v\d+\.\d+\.\d+';/, `const CACHE_NAME = 'vocepodetudo-pwa-v${NEW_VER}';`);
  fs.writeFileSync(swPath, sw, 'utf8');
  console.log(`✅ sw.js atualizado para v=${NEW_VER}`);
}

console.log(`\n🎉 Performance otimizada:`);
console.log(`- ${optimizedLucideCount} páginas com Lucide Icons convertido para carregamento assíncrono (defer).`);
console.log(`- Todas as páginas sincronizadas para v=${NEW_VER}.`);
