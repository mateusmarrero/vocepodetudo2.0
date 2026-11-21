const fs = require('fs');

const indexHtml = fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/index.html', 'utf8');
const lines = indexHtml.split('\n');
lines.forEach((l, i) => {
  if (l.includes('Acessar Curso Oficial') || l.includes('Auxiliar de Creche') || l.includes('course-card')) {
    console.log((i+1) + ': ' + l.trim());
  }
});
