const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

const content = fs.readFileSync(path.join(baseDir, 'blog.html'), 'utf-8');
const lines = content.split('\n');
console.log(lines.slice(355, 420).join('\n'));
