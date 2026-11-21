const fs = require('fs');
const path = require('path');

const projectDir = 'C:\\Users\\usuario\\Downloads\\VCPDTD ANTIGRAVITY';

console.log('=== DETALHES DE INDEX.HTML (OCORRÊNCIAS DE WWW) ===');
const indexHtml = fs.readFileSync(path.join(projectDir, 'index.html'), 'utf8');
const lines = indexHtml.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('www.vocepodetudo.com')) {
    console.log(`Linha ${idx + 1}: ${line.trim()}`);
  }
});

console.log('\n=== DETALHES DE MANIFEST.JSON ===');
const manifest = fs.readFileSync(path.join(projectDir, 'manifest.json'), 'utf8');
console.log(manifest);

console.log('\n=== DETALHES DE SITEMAP.XML DUPLICIDADES ===');
const sitemap = fs.readFileSync(path.join(projectDir, 'sitemap.xml'), 'utf8');
const locMatches = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
console.log(`Total URLs: ${locMatches.length}`);
// Ver se há curriculo.html e criar-curriculo
console.log('curriculo entries:', locMatches.filter(l => l.includes('curriculo')));
console.log('materiais entries:', locMatches.filter(l => l.includes('materiais') || l.includes('downloads')));

console.log('\n=== ARTIGO.PHP ===');
const artigo = fs.readFileSync(path.join(projectDir, 'artigo.php'), 'utf8');
const artigoLines = artigo.split('\n');
artigoLines.forEach((l, idx) => {
  if (l.includes('www.vocepodetudo.com')) {
    console.log(`Linha ${idx + 1}: ${l.trim()}`);
  }
});
