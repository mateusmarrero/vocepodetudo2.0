const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

['blog.html', 'vagas.html', 'curriculo.html'].forEach(f => {
  const content = fs.readFileSync(path.join(baseDir, f), 'utf-8');
  console.log(`=== ${f} HEADER ===`);
  const hStart = content.indexOf('<header');
  const hEnd = content.indexOf('</header>', hStart);
  if (hStart !== -1) {
    console.log(content.slice(hStart, hStart + 600));
  }
});
