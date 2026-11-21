const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

const html = fs.readFileSync(path.join(baseDir, 'downloads.html'), 'utf-8');

const buttons = [
  'btn-download-curriculo',
  'btn-download-planilha',
  'btn-download-checklist',
  'btn-download-contrato',
  'btn-download-carta',
  'btn-download-cronograma'
];

console.log('=== VERIFICAÇÃO DOS BOTÕES DE DOWNLOAD EM downloads.html ===');
buttons.forEach(id => {
  const hasButtonTag = html.includes(`id="${id}"`);
  const hasListener = html.includes(`document.getElementById('${id}')`);
  console.log(`Botão [${id}]: Tag HTML = ${hasButtonTag ? 'SIM' : 'FALTA'} | Event Listener = ${hasListener ? 'SIM' : 'FALTA'}`);
});
