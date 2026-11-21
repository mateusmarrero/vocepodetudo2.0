const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

const indexHtml = fs.readFileSync(path.join(baseDir, 'index.html'), 'utf-8');

console.log('Ocorrencias de materiais-gratuitos no index.html:');
const matches = indexHtml.match(/.{0,60}materiais-gratuitos\.html.{0,60}/g);
console.log(matches || 'NENHUMA!');

console.log('\nMenu mobile tem materiais-gratuitos?');
const mobileMenuMatch = indexHtml.match(/id="mobile-drawer"[\s\S]*?<\/div>\s*<\/div>/i);
if (mobileMenuMatch) {
  console.log('Mobile menu contém materiais-gratuitos?', mobileMenuMatch[0].includes('materiais-gratuitos.html'));
}
