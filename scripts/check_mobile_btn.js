const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

['sobre.html', 'contato.html', 'downloads.html'].forEach(f => {
  const c = fs.readFileSync(path.join(baseDir, f), 'utf-8');
  console.log(f, 'tem mobile-menu:', c.includes('mobile-menu') || c.includes('mobile-drawer') || c.includes('btn-mobile'));
});
