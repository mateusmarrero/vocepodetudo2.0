const fs = require('fs');

const adminJs = fs.readFileSync('src/admin.js', 'utf8');
const lines = adminJs.split('\n');

console.log('Total de linhas em src/admin.js:', lines.length);
console.log(lines.slice(-30).join('\n'));
