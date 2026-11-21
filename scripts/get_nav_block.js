const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

const indexHtml = fs.readFileSync(path.join(baseDir, 'index.html'), 'utf-8');

// Achar a linha onde começa o nav e onde termina
const startNav = indexHtml.indexOf('<nav class="hidden lg:flex');
const endNav = indexHtml.indexOf('</nav>', startNav);

console.log(indexHtml.slice(startNav, endNav + 6));
