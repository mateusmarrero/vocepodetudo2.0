const fs = require('fs');

const indexHtml = fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/index.html', 'utf8');
const lines = indexHtml.split('\n');
lines.forEach((l, i) => {
  if (l.includes('modal') && (l.includes('aluno') || l.includes('estudante') || l.includes('login') || l.includes('jornada') || l.includes('perfil'))) {
    console.log((i+1) + ': ' + l.trim());
  }
});
