const fs = require('fs');

const appJs = fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/src/app.js', 'utf8');
const lines = appJs.split('\n');
console.log(lines.slice(1390, 1470).join('\n'));
