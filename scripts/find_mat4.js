const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

const html = fs.readFileSync(path.join(baseDir, 'downloads.html'), 'utf-8');
const lines = html.split('\n');

lines.forEach((l, i) => {
  if (l.includes('<!-- Material 4') || l.includes('btn-download-contrato') || l.includes('<!-- Bloco Oficial AdSense')) {
    console.log(`L${i+1}: ${l}`);
  }
});
