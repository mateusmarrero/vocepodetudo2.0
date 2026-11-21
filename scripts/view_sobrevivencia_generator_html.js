const fs = require('fs');

const adminPath = 'C:\\Users\\usuario\\Downloads\\ANTIGRAVITY\\sobrevivencia\\admin.html';
const content = fs.readFileSync(adminPath, 'utf8');

const lines = content.split('\n');
console.log(lines.slice(1405, 1515).join('\n'));
