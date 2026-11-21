const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const adminHtml = fs.readFileSync(path.join(ROOT, 'admin.html'), 'utf8');

const navStart = adminHtml.indexOf('<nav');
const navEnd = adminHtml.indexOf('</nav>', navStart);
console.log(adminHtml.slice(navStart, navEnd + 6));
