const fs = require('fs');

const detailsJs = fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/src/data/course_details.js', 'utf8');
const lines = detailsJs.split('\n');
console.log(lines.slice(0, 35).join('\n'));
console.log('--- Tail ---');
console.log(lines.slice(-30).join('\n'));
