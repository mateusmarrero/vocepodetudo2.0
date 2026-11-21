const fs = require('fs');
const path = require('path');

const projectDir = path.resolve(__dirname, '..');

console.log('=== ATUALIZANDO VERSÃO PARA v4.70.0 ===');

// 1. Atualizar sw.js
const swPath = path.join(projectDir, 'sw.js');
let sw = fs.readFileSync(swPath, 'utf8');
sw = sw.replace(/vocepodetudo-pwa-v4\.69\.0/g, 'vocepodetudo-pwa-v4.70.0');
fs.writeFileSync(swPath, sw, 'utf8');
console.log('✅ sw.js atualizado para v4.70.0');

// 2. Atualizar todos os arquivos HTML
const htmlFiles = fs.readdirSync(projectDir).filter(f => f.endsWith('.html'));
let countHtml = 0;
htmlFiles.forEach(f => {
  const filePath = path.join(projectDir, f);
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('4.69.0')) {
    content = content.replace(/4\.69\.0/g, '4.70.0');
    fs.writeFileSync(filePath, content, 'utf8');
    countHtml++;
  }
});
console.log(`✅ ${countHtml} arquivos HTML atualizados com cache-busting v4.70.0`);

// 3. Atualizar manifest.json se existir versão nele
const manifestPath = path.join(projectDir, 'manifest.json');
if (fs.existsSync(manifestPath)) {
  let manifest = fs.readFileSync(manifestPath, 'utf8');
  if (manifest.includes('4.69.0')) {
    manifest = manifest.replace(/4\.69\.0/g, '4.70.0');
    fs.writeFileSync(manifestPath, manifest, 'utf8');
    console.log('✅ manifest.json atualizado para v4.70.0');
  }
}

console.log('=== BUMP DE VERSÃO v4.70.0 CONCLUÍDO ===');
