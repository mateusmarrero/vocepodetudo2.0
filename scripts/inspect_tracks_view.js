const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

const tracksIdx = indexHtml.indexOf('id="tracks-view"');
console.log('tracks-view:', tracksIdx !== -1 ? 'Encontrado' : 'Não encontrado');
if (tracksIdx !== -1) {
  console.log(indexHtml.slice(tracksIdx, tracksIdx + 800));
}
