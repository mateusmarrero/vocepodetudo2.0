const fs = require('fs');

const studentPhp = fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/api/student.php', 'utf8').split('\n');
console.log(studentPhp.slice(790, 850).join('\n'));
