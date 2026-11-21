const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\usuario\\Downloads\\VCPDTD ANTIGRAVITY';
const index = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');

const lines = index.split('\n');
console.log('=== LINKS PARA VAGAS.HTML E BLOG.HTML EM INDEX.HTML ===');
lines.forEach((l, i) => {
  if (l.includes('vagas.html') || l.includes('blog.html')) {
    console.log(`L${i+1}: ${l.trim()}`);
  }
});
