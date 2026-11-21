const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

const p = path.join(baseDir, 'downloads.html');
const content = fs.readFileSync(p, 'utf-8');
const hStart = content.indexOf('<header');
const hEnd = content.indexOf('</header>', hStart);
console.log(content.slice(hStart, hEnd + 9));
