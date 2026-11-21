const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

const html = fs.readFileSync(path.join(baseDir, 'calculadora-trabalhista.html'), 'utf-8');
const lines = html.split('\n');

lines.forEach((l, i) => {
  if (l.includes('calc-tab-btn') || l.includes('tab-content') || l.includes('tab-salario')) {
    console.log(`L${i+1}: ${l}`);
  }
});
