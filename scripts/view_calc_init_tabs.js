const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const calcJs = fs.readFileSync(path.join(ROOT, 'src', 'calculadora.js'), 'utf8');

const tabFnStart = calcJs.indexOf('function initTabs(');
console.log(calcJs.slice(tabFnStart, tabFnStart + 800));
