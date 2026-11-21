const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const adminHtml = fs.readFileSync(path.join(ROOT, 'admin.html'), 'utf8');

const desktopNavMatch = adminHtml.match(/<nav[^>]*id="admin-desktop-tabs"[^>]*>([\s\S]*?)<\/nav>/) || adminHtml.match(/<div[^>]*id="admin-desktop-tabs"[^>]*>([\s\S]*?)<\/div>/);

if (desktopNavMatch) {
  console.log('Encontrado desktop tabs:');
  console.log(desktopNavMatch[0].slice(0, 1000));
} else {
  console.log('Buscando ocorrências de tab-btn-overview...');
  const occurrences = adminHtml.match(/id="tab-btn-overview"[^>]*>/g) || [];
  console.log(occurrences);
}
