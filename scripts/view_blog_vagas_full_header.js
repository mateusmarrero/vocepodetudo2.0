const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

['blog.html', 'vagas.html'].forEach(f => {
  const content = fs.readFileSync(path.join(baseDir, f), 'utf-8');
  console.log(`=== ${f} HEADER COMPLETO ===`);
  const hStart = content.indexOf('<header');
  const hEnd = content.indexOf('</header>', hStart);
  console.log(content.slice(hStart, hEnd + 9));
});
