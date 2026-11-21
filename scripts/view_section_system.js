const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const adminHtml = fs.readFileSync(path.join(ROOT, 'admin.html'), 'utf8');

const secStart = adminHtml.indexOf('id="section-system"');
console.log(adminHtml.slice(secStart, secStart + 1500));
