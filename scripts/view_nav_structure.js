const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

const indexHtml = fs.readFileSync(path.join(baseDir, 'index.html'), 'utf-8');
const lines = indexHtml.split('\n');

console.log('--- FIM DO NAV DESKTOP (linhas 680 a 730) ---');
console.log(lines.slice(680, 730).join('\n'));

console.log('--- MOBILE DRAWER (linhas 1000 a 1080) ---');
console.log(lines.slice(1000, 1080).join('\n'));
