const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\usuario\\Downloads\\VCPDTD ANTIGRAVITY';
const vagasHtml = fs.readFileSync(path.join(dir, 'vagas.html'), 'utf8');

const lines = vagasHtml.split('\n');
console.log('--- Procurando contêiner de vagas em vagas.html ---');
lines.forEach((l, i) => {
  if (l.includes('id="jobs-grid"') || l.includes('id="jobs-search-input"') || l.includes('jobs-count-badge')) {
    console.log((i+1) + ': ' + l.trim());
  }
});
