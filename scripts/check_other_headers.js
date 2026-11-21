const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

const pages = ['blog.html', 'curriculo.html', 'vagas.html', 'downloads.html', 'sobre.html', 'contato.html'];

pages.forEach(p => {
  const content = fs.readFileSync(path.join(baseDir, p), 'utf-8');
  const navMatch = content.match(/<nav[^>]*>[\s\S]*?<\/nav>/i);
  console.log(`=== ${p} ===`);
  if (navMatch) {
    console.log(navMatch[0].replace(/\s+/g, ' ').slice(0, 200));
  } else {
    console.log('Sem nav');
  }
});
