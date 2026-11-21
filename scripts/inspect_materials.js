const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

const html = fs.readFileSync(path.join(baseDir, 'downloads.html'), 'utf-8');
const lines = html.split('\n');

lines.forEach((l, i) => {
  if (l.includes('<!-- Material') || l.includes('grid-cols-1 md:grid-cols-2')) {
    console.log(`L${i+1}: ${l}`);
  }
});
