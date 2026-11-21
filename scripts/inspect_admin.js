const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const adminHtml = fs.readFileSync(path.join(ROOT, 'admin.html'), 'utf8');

console.log('=== SEÇÕES E ABAS DO ADMIN.HTML ===');
const navMatches = adminHtml.match(/id="tab-[^"]+"/g) || [];
const navList = adminHtml.match(/<button[^>]+id="tab-[^>]+>/g) || [];
console.log('Abas encontradas:');
navList.forEach(btn => {
  const text = btn.replace(/<[^>]+>/g, '').trim();
  const idMatch = btn.match(/id="([^"]+)"/);
  console.log(`- ${idMatch ? idMatch[1] : 'sem-id'}`);
});

console.log('\n=== TÍTULOS DE SEÇÕES ===');
const h2s = adminHtml.match(/<h2[^>]*>([\s\S]*?)<\/h2>/g) || [];
h2s.forEach(h => {
  console.log('H2:', h.replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' '));
});
