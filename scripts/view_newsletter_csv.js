const fs = require('fs');

const newsPhp = fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/api/newsletter.php', 'utf8').split('\n');
console.log(newsPhp.slice(260, 285).join('\n'));
