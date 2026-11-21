const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

const indexHtml = fs.readFileSync(path.join(baseDir, 'index.html'), 'utf-8');
const navStart = indexHtml.indexOf('<nav class="hidden lg:flex');
const navEnd = indexHtml.indexOf('</nav>', navStart);
console.log('Tamanho da nav atual:', navEnd - navStart);
console.log('Nav start line:', indexHtml.slice(0, navStart).split('\n').length);
console.log('Nav end line:', indexHtml.slice(0, navEnd).split('\n').length);
