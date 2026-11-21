const fs = require('fs');
const content = fs.readFileSync('admin.html', 'utf8');
const lines = content.split('\n');
console.log('--- 2360 a 2390 ---');
console.log(lines.slice(2360, 2390).join('\n'));
