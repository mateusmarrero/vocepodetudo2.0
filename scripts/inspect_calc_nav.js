const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const calcHtml = fs.readFileSync(path.join(ROOT, 'calculadora-trabalhista.html'), 'utf8');

const tabStart = calcHtml.indexOf('data-tab=');
if (tabStart !== -1) {
  console.log('Encontrado data-tab:');
  console.log(calcHtml.slice(tabStart - 100, tabStart + 1200));
} else {
  console.log('Buscando botões da nav...');
  const nav = calcHtml.match(/<nav[^>]*>([\s\S]*?)<\/nav>/);
  if (nav) console.log(nav[0].slice(0, 1000));
}
