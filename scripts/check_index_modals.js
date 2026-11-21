const fs = require('fs');

const indexHtml = fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/index.html', 'utf8');
const lines = indexHtml.split('\n');
lines.forEach((l, i) => {
  if (l.includes('modal') && (l.includes('analytics') || l.includes('trafego') || l.includes('audiencia') || l.includes('metricas') || l.includes('estatisticas'))) {
    console.log((i+1) + ': ' + l.trim());
  }
});
