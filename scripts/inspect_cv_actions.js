const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const cvHtml = fs.readFileSync(path.join(ROOT, 'curriculo.html'), 'utf8');

const exportBtn = cvHtml.match(/id="btn-export-pdf"/);
if (exportBtn) {
  const idx = cvHtml.indexOf('id="btn-export-pdf"');
  console.log(cvHtml.slice(idx - 200, idx + 600));
}
