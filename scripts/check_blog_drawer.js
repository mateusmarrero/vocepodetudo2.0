const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

['blog.html', 'vagas.html'].forEach(f => {
  const content = fs.readFileSync(path.join(baseDir, f), 'utf-8');
  console.log(`=== ${f} DRAWER MOBILE ===`);
  const dStart = content.indexOf('id="mobile-drawer"');
  if (dStart !== -1) {
    console.log(content.slice(dStart, dStart + 800));
  }
});
