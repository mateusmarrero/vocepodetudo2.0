const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

const html = fs.readFileSync(path.join(baseDir, 'calculadora-trabalhista.html'), 'utf-8');
const lines = html.split('\n');
console.log(lines.slice(450, 520).join('\n'));
