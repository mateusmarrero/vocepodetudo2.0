const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const adminHtml = fs.readFileSync(path.join(ROOT, 'admin.html'), 'utf8');

const idx = adminHtml.indexOf('id="tab-btn-overview"');
console.log(adminHtml.slice(idx - 400, idx + 1200));
