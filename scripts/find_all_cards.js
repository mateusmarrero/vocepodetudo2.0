const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\usuario\\Downloads\\VCPDTD ANTIGRAVITY';
const index = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');

const lines = index.split('\n');
console.log('--- Procurando cards de curriculo, vagas, blog, teste vocacional ---');
lines.forEach((l, i) => {
  if (l.includes('curriculo.html') || l.includes('vagas.html') || l.includes('blog.html') || l.includes('teste-vocacional.html') || l.includes('career-test')) {
    console.log(`L${i+1}: ${l.trim().slice(0, 100)}`);
  }
});
