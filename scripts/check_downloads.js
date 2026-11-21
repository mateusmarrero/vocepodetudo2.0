const fs = require('fs');
const path = require('path');

const baseDir = path.resolve(__dirname, '..');
const files = fs.readdirSync(baseDir);

console.log('=== ARQUIVOS HTML NO PROJETO ===');
files.filter(f => f.endsWith('.html')).forEach(f => console.log('-', f));

console.log('\n=== LINKS NO HEADER / NAV DE index.html ===');
const indexHtml = fs.readFileSync(path.join(baseDir, 'index.html'), 'utf-8');
const navMatch = indexHtml.match(/<nav[\s\S]*?<\/nav>/i);
if (navMatch) {
  console.log(navMatch[0]);
} else {
  console.log('Nenhuma tag <nav> encontrada.');
}

console.log('\n=== CONTEUDO DE materiais-gratuitos.html ===');
if (fs.existsSync(path.join(baseDir, 'materiais-gratuitos.html'))) {
  const mat = fs.readFileSync(path.join(baseDir, 'materiais-gratuitos.html'), 'utf-8');
  console.log('Titulo / H1:');
  const h1 = mat.match(/<h1[\s\S]*?<\/h1>/i);
  console.log(h1 ? h1[0] : 'Sem h1');
  console.log('Total de linhas:', mat.split('\n').length);
}
