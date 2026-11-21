const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

const calcJs = fs.readFileSync(path.join(baseDir, 'src', 'calculadora.js'), 'utf-8');
const lines = calcJs.split('\n');

lines.forEach((l, i) => {
  if (l.includes('function') || l.includes('calcular') || l.includes('tab-') || l.includes('btn-calc')) {
    console.log(`L${i+1}: ${l}`);
  }
});
