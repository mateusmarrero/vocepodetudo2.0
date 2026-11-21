const fs = require('fs');

const adminJs = fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/src/admin.js', 'utf8');
const lines = adminJs.split('\n');
console.log(lines.slice(710, 770).join('\n'));
