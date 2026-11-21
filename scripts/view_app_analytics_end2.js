const fs = require('fs');

const appJs = fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/src/app.js', 'utf8');
const lines = appJs.split('\n');
console.log(lines.slice(4480, 4530).join('\n'));
