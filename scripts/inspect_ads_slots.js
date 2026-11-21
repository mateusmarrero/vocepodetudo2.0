const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const cvHtml = fs.readFileSync(path.join(ROOT, 'curriculo.html'), 'utf8');

const matches = cvHtml.match(/<ins class="adsbygoogle"[\s\S]*?<\/ins>/g) || [];
console.log('Blocos adsbygoogle em curriculo.html:', matches.length);
matches.forEach((m, i) => console.log(`[${i}]`, m));
