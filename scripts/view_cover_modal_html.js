const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const cvHtml = fs.readFileSync(path.join(ROOT, 'curriculo.html'), 'utf8');

const modalStart = cvHtml.indexOf('id="cover-letter-modal"');
console.log(cvHtml.slice(modalStart, modalStart + 1500));
