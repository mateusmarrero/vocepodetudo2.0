const fs = require('fs');

const adminHtml = fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/admin.html', 'utf8');
const lines = adminHtml.split('\n');
console.log(lines.slice(10, 30).join('\n'));
