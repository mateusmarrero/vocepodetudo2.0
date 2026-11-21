const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const tvJs = fs.readFileSync(path.join(ROOT, 'src', 'teste-vocacional.js'), 'utf8');

const waIdx = tvJs.indexOf('whatsapp');
console.log('Ocorrências de whatsapp em teste-vocacional.js:', waIdx !== -1 ? 'Sim' : 'Não');
