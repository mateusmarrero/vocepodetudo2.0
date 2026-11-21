const fs = require('fs');

console.log('--- admin_students.php lines 160-190 ---');
const adminStudents = fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/api/admin_students.php', 'utf8').split('\n');
console.log(adminStudents.slice(155, 195).join('\n'));

console.log('--- blog.php lines 740-760 ---');
const blogPhp = fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/api/blog.php', 'utf8').split('\n');
console.log(blogPhp.slice(735, 760).join('\n'));
