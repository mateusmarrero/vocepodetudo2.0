const fs = require('fs');

const jobsPhp = fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/api/jobs.php', 'utf8');
const lines = jobsPhp.split('\n');
console.log(lines.slice(0, 100).join('\n'));
