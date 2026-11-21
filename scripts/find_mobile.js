const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

const indexHtml = fs.readFileSync(path.join(baseDir, 'index.html'), 'utf-8');

// Achar mobile menu
const lines = indexHtml.split('\n');
lines.forEach((l, i) => {
  if (l.includes('mobile-menu') || l.includes('mobile-drawer') || l.includes('menu-mobile') || l.includes('id="mobile')) {
    console.log(`Linha ${i+1}: ${l}`);
  }
});
