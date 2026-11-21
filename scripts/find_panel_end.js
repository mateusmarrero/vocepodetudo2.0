const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

const html = fs.readFileSync(path.join(baseDir, 'calculadora-trabalhista.html'), 'utf-8');
const lines = html.split('\n');

lines.forEach((l, i) => {
  if (l.includes('id="panel-rescisao"')) {
    console.log(`Painel rescisao começa em: L${i+1}`);
  }
  if (l.includes('<!-- Bloco Oficial AdSense (Abaixo da Calculadora) -->')) {
    console.log(`Bloco adsense começa em: L${i+1}`);
  }
});
