const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const calcHtml = fs.readFileSync(path.join(ROOT, 'calculadora-trabalhista.html'), 'utf8');

const btnStart = calcHtml.indexOf('calc-tab-btn');
console.log(calcHtml.slice(btnStart - 100, btnStart + 1200));
