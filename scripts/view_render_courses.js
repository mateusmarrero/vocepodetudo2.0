const fs = require('fs');

const appJs = fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/src/app.js', 'utf8');
const lines = appJs.split('\n');
console.log(lines.slice(1520, 1600).join('\n'));
console.log('--- 1680 to 1730 ---');
console.log(lines.slice(1680, 1730).join('\n'));
