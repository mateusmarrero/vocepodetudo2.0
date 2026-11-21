const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const cvHtml = fs.readFileSync(path.join(ROOT, 'curriculo.html'), 'utf8');

const idx = cvHtml.indexOf('<ins class="adsbygoogle"');
console.log(cvHtml.slice(idx - 300, idx + 400));
