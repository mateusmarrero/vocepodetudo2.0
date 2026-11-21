const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\usuario\\Downloads\\VCPDTD ANTIGRAVITY';
const index = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');

console.log('=== SECTIONS IN INDEX.HTML ===');
const sectionMatches = [...index.matchAll(/<section[^>]*id=["']([^"']+)["'][^>]*>/gi)];
sectionMatches.forEach(m => console.log('Section id:', m[1]));

console.log('\n=== BUSCANDO MENÇÕES A "vagas" OU "blog" EM INDEX.HTML ===');
const lines = index.split('\n');
lines.forEach((l, i) => {
  if (l.includes('id="blog"') || l.includes('id="vagas"') || l.includes('id="mural-vagas"') || l.includes('id="artigos"') || l.includes('id="jobs"')) {
    console.log(`Linha ${i + 1}: ${l.trim()}`);
  }
});

console.log('\n=== LINKS DO HEADER EM INDEX.HTML ===');
const headerSnippet = index.slice(0, 4000);
const links = [...headerSnippet.matchAll(/href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
links.forEach(l => {
  const text = l[2].replace(/<[^>]+>/g, '').trim();
  console.log(`Link: "${text}" -> href="${l[1]}"`);
});

console.log('\n=== SCRIPTS CARREGADOS EM INDEX.HTML ===');
const scripts = [...index.matchAll(/<script[^>]*src=["']([^"']+)["'][^>]*>/gi)];
scripts.forEach(s => console.log('Script:', s[1]));
