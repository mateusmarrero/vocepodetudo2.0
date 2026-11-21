const fs = require('fs');

const deployJs = fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/scripts/deploy_ftp.js', 'utf8');
const lines = deployJs.split('\n');
console.log(lines.slice(120, 160).join('\n'));
