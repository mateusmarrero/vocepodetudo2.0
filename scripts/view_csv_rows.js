const fs = require('fs');

const adminStudents = fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/api/admin_students.php', 'utf8').split('\n');
console.log(adminStudents.slice(68, 105).join('\n'));
