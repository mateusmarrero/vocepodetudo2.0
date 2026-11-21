const fs = require('fs');

const resumesPhp = fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/api/resumes.php', 'utf8').split('\n');
console.log(resumesPhp.slice(590, 620).join('\n'));
