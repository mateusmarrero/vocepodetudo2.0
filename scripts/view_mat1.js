const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

const html = fs.readFileSync(path.join(baseDir, 'downloads.html'), 'utf-8');
const lines = html.split('\n');
console.log(lines.slice(123, 160).join('\n'));
