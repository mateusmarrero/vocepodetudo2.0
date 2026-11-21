const fs = require('fs');

const adminHtml = fs.readFileSync('admin.html', 'utf8');
const lines = adminHtml.split('\n');

const geoIndex = lines.findIndex(l => l.includes('Grade Geográfica: Estados do Brasil & Cidades'));
console.log('Linha antes da Grade Geográfica:', geoIndex + 1);
console.log(lines.slice(geoIndex - 15, geoIndex + 5).join('\n'));
