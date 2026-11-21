const fs = require('fs');

const authPhp = fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/api/auth.php', 'utf8').split('\n');
console.log(authPhp.slice(90, 115).join('\n'));
