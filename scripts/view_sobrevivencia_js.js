const fs = require('fs');

const jsPath = 'C:\\Users\\usuario\\Downloads\\ANTIGRAVITY\\sobrevivencia\\assets\\js\\admin.js';
const content = fs.readFileSync(jsPath, 'utf8');

const lines = content.split('\n');
console.log(lines.slice(1030, 1180).join('\n'));
