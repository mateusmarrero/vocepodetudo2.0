const fs = require('fs');

const coursesPhp = fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/api/courses.php', 'utf8');
const lines = coursesPhp.split('\n');
console.log(lines.slice(0, 100).join('\n'));
