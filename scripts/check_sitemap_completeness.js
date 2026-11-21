const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

const sitemap = fs.readFileSync(path.join(baseDir, 'sitemap.xml'), 'utf-8');
const urls = sitemap.match(/<loc>(.*?)<\/loc>/g).map(u => u.replace(/<\/?loc>/g, ''));

console.log('Total de URLs no sitemap.xml:', urls.length);

const publicHtmlFiles = fs.readdirSync(baseDir).filter(f => f.endsWith('.html') && f !== 'admin.html' && f !== 'materiais-gratuitos.html');

console.log('\n--- VERIFICAÇÃO DE PÁGINAS HTML NO SITEMAP ---');
publicHtmlFiles.forEach(f => {
  const isIncluded = urls.some(u => u.endsWith('/' + f));
  console.log(`${f}: ${isIncluded ? 'PRESENTE' : 'FALTA NO SITEMAP'}`);
});
