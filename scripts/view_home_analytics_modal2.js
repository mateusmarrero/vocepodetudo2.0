const fs = require('fs');

const indexHtml = fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/index.html', 'utf8');
const lines = indexHtml.split('\n');
console.log(lines.slice(2835, 2920).join('\n'));
