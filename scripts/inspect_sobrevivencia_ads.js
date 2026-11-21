const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\usuario\\Downloads\\ANTIGRAVITY\\sobrevivencia';
const files = ['admin.html', 'index.html', 'contato.html', 'sobre.html'];

files.forEach(f => {
  const full = path.join(dir, f);
  if (fs.existsSync(full)) {
    const text = fs.readFileSync(full, 'utf8');
    const lines = text.split('\n');
    lines.forEach((l, idx) => {
      if (l.toLowerCase().includes('aluguel') || l.toLowerCase().includes('propaganda') || l.toLowerCase().includes('anuncie')) {
        console.log(`${f} L${idx + 1}: ${l.trim().slice(0, 140)}`);
      }
    });
  }
});
