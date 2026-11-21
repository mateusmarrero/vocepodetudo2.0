const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const files = fs.readdirSync(ROOT_DIR).filter(f => f.endsWith('.html'));

console.log(`Verificando ${files.length} arquivos HTML...`);

files.forEach(file => {
  const content = fs.readFileSync(path.join(ROOT_DIR, file), 'utf8');
  const headerMatch = content.match(/<header[\s\S]*?<\/header>/i);
  if (!headerMatch) return;

  const header = headerMatch[0];
  const hasButtonsWithoutHidden = header.includes('inline-flex') && !header.includes('hidden sm:') && !header.includes('hidden md:');
  
  if (file === 'index.html' || file === 'vagas.html' || file === 'curriculo.html') {
    console.log(`\n📄 [${file}]:`);
    const buttons = header.match(/<a[^>]*class="[^"]*inline-flex[^"]*"|<button[^>]*class="[^"]*inline-flex[^"]*"/g) || [];
    buttons.forEach(b => console.log('  ', b.slice(0, 90)));
  }
});
