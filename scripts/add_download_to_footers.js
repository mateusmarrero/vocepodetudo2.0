const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

const files = fs.readdirSync(baseDir).filter(f => f.endsWith('.html') && f !== 'admin.html');

files.forEach(file => {
  const filePath = path.join(baseDir, file);
  let html = fs.readFileSync(filePath, 'utf-8');

  // Se o footer tem links institucionais mas não tem downloads.html
  if (html.includes('politica-privacidade.html') && !html.includes('href="downloads.html"')) {
    html = html.replace(
      '<a href="politica-privacidade.html"',
      '<a href="downloads.html" class="hover:text-emerald-400 transition-colors font-medium text-slate-300">Downloads Grátis</a>\n        <span>•</span>\n        <a href="politica-privacidade.html"'
    );
    fs.writeFileSync(filePath, html, 'utf-8');
    console.log(`[OK] Inserido link Downloads no footer de ${file}`);
  }
});
