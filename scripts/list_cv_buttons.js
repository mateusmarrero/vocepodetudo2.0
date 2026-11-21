const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const cvHtml = fs.readFileSync(path.join(ROOT, 'curriculo.html'), 'utf8');

const btns = cvHtml.match(/<button[^>]+id="[^"]+"[^>]*>/g) || [];
console.log(btns.slice(0, 20).join('\n'));
