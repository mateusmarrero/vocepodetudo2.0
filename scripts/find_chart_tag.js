const fs = require('fs');

const adminHtml = fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/admin.html', 'utf8');
const lines = adminHtml.split('\n');
lines.forEach((l, i) => {
  if (l.includes('chart.js') || l.includes('chart.umd')) {
    console.log((i+1) + ': ' + l.trim());
  }
});
