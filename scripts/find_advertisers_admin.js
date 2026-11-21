const fs = require('fs');

const adminHtml = fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/admin.html', 'utf8');
const lines = adminHtml.split('\n');
lines.forEach((l, i) => {
  if (l.includes('anunciante') || l.includes('campanha') || l.includes('publicidade') || l.includes('proposta')) {
    console.log((i+1) + ': ' + l.trim());
  }
});
