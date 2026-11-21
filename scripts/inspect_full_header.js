const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

const indexHtml = fs.readFileSync(path.join(baseDir, 'index.html'), 'utf-8');

// Inspecionar o header do index.html (linhas 350 a 1050)
const headerStart = indexHtml.indexOf('<header');
const headerEnd = indexHtml.indexOf('</header>', headerStart);
console.log('Tamanho do bloco header:', headerEnd - headerStart);
console.log('Linhas do header:');
console.log(indexHtml.slice(headerStart, headerStart + 1500));
