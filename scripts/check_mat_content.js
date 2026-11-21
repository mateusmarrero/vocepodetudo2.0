const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

const mat = fs.readFileSync(path.join(baseDir, 'materiais-gratuitos.html'), 'utf-8');
console.log('Title:', mat.match(/<title>[\s\S]*?<\/title>/i)?.[0]);
console.log('Primeiras 120 linhas:');
console.log(mat.split('\n').slice(0, 120).join('\n'));
