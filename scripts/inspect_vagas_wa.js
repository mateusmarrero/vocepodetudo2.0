const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const vagasJs = fs.readFileSync(path.join(ROOT, 'src', 'vagas.js'), 'utf8');

const waIdx = vagasJs.indexOf('whatsapp');
console.log('Ocorrências de whatsapp em vagas.js:', waIdx !== -1 ? 'Sim' : 'Não');
if (waIdx !== -1) {
  console.log(vagasJs.slice(waIdx - 100, waIdx + 400));
}
