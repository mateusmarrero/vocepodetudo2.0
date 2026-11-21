const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

const indexHtml = fs.readFileSync(path.join(baseDir, 'index.html'), 'utf-8');
const lines = indexHtml.split('\n');
console.log(lines.slice(2285, 2345).join('\n'));
