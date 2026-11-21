const fs = require('fs');
const path = require('path');

const ROOT_DIR = 'C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY';
const OLD_VER = '4.82.1';
const NEW_VER = '4.83.0';

const files = fs.readdirSync(ROOT_DIR).filter(f => f.endsWith('.html'));

for (const file of files) {
  const filePath = path.join(ROOT_DIR, file);
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/\?v=4\.82\.1/g, `?v=${NEW_VER}`);
  fs.writeFileSync(filePath, content, 'utf8');
}

const swPath = path.join(ROOT_DIR, 'sw.js');
if (fs.existsSync(swPath)) {
  let sw = fs.readFileSync(swPath, 'utf8');
  sw = sw.replace(/const CACHE_NAME = 'vocepodetudo-pwa-v4\.82\.1';/, `const CACHE_NAME = 'vocepodetudo-pwa-v${NEW_VER}';`);
  fs.writeFileSync(swPath, sw, 'utf8');
}

console.log(`✅ Bump para v=${NEW_VER} concluído com sucesso.`);
