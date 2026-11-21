const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const cvHtml = fs.readFileSync(path.join(ROOT, 'curriculo.html'), 'utf8');

const matches = cvHtml.match(/openCoverLetterModal/g) || [];
console.log('Ocorrências de openCoverLetterModal em curriculo.html:', matches.length);

const cvJs = fs.readFileSync(path.join(ROOT, 'src', 'curriculo.js'), 'utf8');
const jsIdx = cvJs.indexOf('openCoverLetterModal');
if (jsIdx !== -1) {
  console.log(cvJs.slice(jsIdx - 100, jsIdx + 800));
}
