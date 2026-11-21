const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

const indexHtml = fs.readFileSync(path.join(baseDir, 'index.html'), 'utf-8');
const lines = indexHtml.split('\n');

lines.forEach((line, idx) => {
  if (line.includes('materiais-gratuitos.html')) {
    console.log(`--- Linha ${idx + 1} ---`);
    console.log(lines.slice(Math.max(0, idx - 4), Math.min(lines.length, idx + 5)).join('\n'));
  }
});
