const fs = require('fs');

const adminHtml = fs.readFileSync('admin.html', 'utf8');
const lines = adminHtml.split('\n');

const dossierEnd = lines.findIndex(l => l.includes('Kit Oficial de Divulgação & Redes Sociais'));
console.log(lines.slice(dossierEnd - 20, dossierEnd + 5).join('\n'));
