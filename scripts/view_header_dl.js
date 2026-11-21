const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

const html = fs.readFileSync(path.join(baseDir, 'downloads.html'), 'utf-8');
const hStart = html.indexOf('<header');
const hEnd = html.indexOf('</header>', hStart);
console.log(html.slice(hStart, hEnd + 9));
