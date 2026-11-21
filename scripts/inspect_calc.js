const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const calcHtml = fs.readFileSync(path.join(ROOT, 'calculadora-trabalhista.html'), 'utf8');
const calcJs = fs.readFileSync(path.join(ROOT, 'src', 'calculadora.js'), 'utf8');

console.log('=== CALCULADORA TRABALHISTA (Abas existentes) ===');
const tabMatches = calcHtml.match(/id="tab-[^"]+"/g) || [];
console.log(tabMatches);

console.log('=== FUNÇÕES EM CALCULADORA.JS ===');
const fns = calcJs.match(/function\s+[a-zA-Z0-9_]+\s*\(/g) || [];
console.log(fns);
