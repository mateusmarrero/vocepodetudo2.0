const fs = require('fs');

const studentPhp = fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/api/student.php', 'utf8').split('\n');

console.log('--- Google OAuth lines 365-395 ---');
console.log(studentPhp.slice(364, 395).join('\n'));

console.log('--- LGPD delete_account lines 815-835 ---');
console.log(studentPhp.slice(814, 835).join('\n'));
