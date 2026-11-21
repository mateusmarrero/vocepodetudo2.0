const fs = require('fs');

const htaccess = fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/.htaccess', 'utf8');
console.log(htaccess);
