const fs = require('fs');

const coursesPhp = fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/api/courses.php', 'utf8').split('\n');
console.log(coursesPhp.slice(460, 510).join('\n'));
