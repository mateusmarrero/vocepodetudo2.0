const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

const indexHtml = fs.readFileSync(path.join(baseDir, 'index.html'), 'utf-8');
const asideStart = indexHtml.indexOf('<aside');
const asideEnd = indexHtml.indexOf('</aside>', asideStart);
console.log(indexHtml.slice(asideStart, asideEnd + 8));
