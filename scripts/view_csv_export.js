const fs = require('fs');

const adminStudents = fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/api/admin_students.php', 'utf8').split('\n');
adminStudents.forEach((l, i) => {
  if (l.includes('csv') || l.includes('fputcsv') || l.includes('Content-Type')) {
    console.log((i+1) + ': ' + l.trim());
  }
});
