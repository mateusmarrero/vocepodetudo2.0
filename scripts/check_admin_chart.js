const fs = require('fs');

const adminHtml = fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/admin.html', 'utf8');
const lines = adminHtml.split('\n');
lines.forEach((l, i) => {
  if (l.includes('traffic-realtime-chart') || l.includes('Painel de Tráfego') || l.includes('Audiência em Tempo Real')) {
    console.log((i+1) + ': ' + l.trim());
  }
});
