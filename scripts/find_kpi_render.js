const fs = require('fs');

const adminJs = fs.readFileSync('src/admin.js', 'utf8');
const lines = adminJs.split('\n');

console.log(lines.slice(724, 790).join('\n'));
