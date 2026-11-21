const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

const indexHtml = fs.readFileSync(path.join(baseDir, 'index.html'), 'utf-8');
const lines = indexHtml.split('\n');

lines.forEach((l, i) => {
  if (l.includes('Institucional') || l.includes('termos-de-uso') || l.includes('politica-privacidade')) {
    console.log(`L${i+1}: ${l}`);
  }
});
