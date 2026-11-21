const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

const indexHtml = fs.readFileSync(path.join(baseDir, 'index.html'), 'utf-8');
const navStart = indexHtml.indexOf('<nav class="hidden lg:flex');
const navEnd = indexHtml.indexOf('</nav>', navStart);
const nav = indexHtml.slice(navStart, navEnd + 6);
const lines = nav.split('\n');
console.log(lines.slice(lines.length - 25).join('\n'));
