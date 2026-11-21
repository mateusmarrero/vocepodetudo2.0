const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\usuario\\Downloads\\VCPDTD ANTIGRAVITY';
const index = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');

const lines = index.split('\n');
lines.forEach((l, i) => {
  if (l.includes('Vagas & Estágios') || l.includes('Blog & Dicas') || l.includes('vagas.html') || l.includes('blog.html') || l.includes('#jobs-section') || l.includes('#blog-section')) {
    console.log(`L${i+1}: ${l.trim()}`);
  }
});
