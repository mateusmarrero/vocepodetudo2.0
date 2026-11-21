const fs = require('fs');

const studentPhp = fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/api/student.php', 'utf8').split('\n');
studentPhp.forEach((l, i) => {
  if (l.includes('delete') || l.includes('excluir') || l.includes('anonymize') || l.includes('exclusao')) {
    console.log((i+1) + ': ' + l.trim());
  }
});
