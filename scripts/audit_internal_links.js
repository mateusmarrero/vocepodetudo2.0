const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\usuario\\Downloads\\VCPDTD ANTIGRAVITY';

const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

console.log('=== LINKS INTERNOS EM ARQUIVOS HTML ===');
files.forEach(f => {
  const c = fs.readFileSync(path.join(dir, f), 'utf8');
  const curriculoHtmlLinks = (c.match(/href=["'][^"']*curriculo\.html[^"']*["']/g) || []);
  const criarCurriculoLinks = (c.match(/href=["'][^"']*criar-curriculo[^"']*["']/g) || []);
  const indexHtmlLinks = (c.match(/href=["'][^"']*index\.html[^"']*["']/g) || []);
  
  if (curriculoHtmlLinks.length > 0 || indexHtmlLinks.length > 0) {
    console.log(`${f}:`);
    if (curriculoHtmlLinks.length > 0) {
      console.log(`  - curriculo.html: ${curriculoHtmlLinks.length} links (ex: ${curriculoHtmlLinks[0]})`);
    }
    if (criarCurriculoLinks.length > 0) {
      console.log(`  - criar-curriculo: ${criarCurriculoLinks.length} links`);
    }
    if (indexHtmlLinks.length > 0) {
      console.log(`  - index.html: ${indexHtmlLinks.length} links (ex: ${indexHtmlLinks[0]})`);
    }
  }
});
