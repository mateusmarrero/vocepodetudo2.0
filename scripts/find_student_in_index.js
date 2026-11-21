const fs = require('fs');

const indexHtml = fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/index.html', 'utf8');
const lines = indexHtml.split('\n');
lines.forEach((l, i) => {
  if (l.includes('student') || l.includes('cadastro-aluno') || l.includes('login-aluno')) {
    console.log((i+1) + ': ' + l.trim());
  }
});
