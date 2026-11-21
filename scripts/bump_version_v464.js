const fs = require('fs');
const path = require('path');

const projectDir = 'C:\\Users\\usuario\\Downloads\\VCPDTD ANTIGRAVITY';

console.log('=== ATUALIZANDO VERSÃO PARA v4.64.0 ===');

// 1. Atualizar sw.js
const swPath = path.join(projectDir, 'sw.js');
let sw = fs.readFileSync(swPath, 'utf8');
sw = sw.replace(/vocepodetudo-pwa-v4\.63\.0/g, 'vocepodetudo-pwa-v4.64.0');
fs.writeFileSync(swPath, sw, 'utf8');
console.log('✅ sw.js atualizado para v4.64.0');

// 2. Atualizar todos os arquivos HTML
const htmlFiles = fs.readdirSync(projectDir).filter(f => f.endsWith('.html'));
htmlFiles.forEach(f => {
  const filePath = path.join(projectDir, f);
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('4.63.0')) {
    content = content.replace(/4\.63\.0/g, '4.64.0');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ [${f}] cache-busting atualizado para v4.64.0`);
  }
});
