const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

const files = fs.readdirSync(baseDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
  const filePath = path.join(baseDir, file);
  let html = fs.readFileSync(filePath, 'utf-8');

  // Não injetar em admin.html se não desejar ou injetar em todas as páginas públicas
  if (file === 'admin.html') return;

  if (!html.includes('cookie-banner.js')) {
    html = html.replace('</body>', '  <script src="./src/cookie-banner.js?v=4.44.0"></script>\n</body>');
    fs.writeFileSync(filePath, html, 'utf-8');
    console.log(`[OK] Injetado cookie-banner.js em ${file}`);
  } else {
    console.log(`[INFO] ${file} já possui cookie-banner.js`);
  }
});
