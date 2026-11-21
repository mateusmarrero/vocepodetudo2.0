const fs = require('fs');

const blogPhp = fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/api/blog.php', 'utf8').split('\n');
console.log(blogPhp.slice(695, 725).join('\n'));
