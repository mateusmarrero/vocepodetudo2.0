const fs = require('fs');

const content = fs.readFileSync('admin.html', 'utf8');
const lines = content.split('\n');

console.log(lines.slice(860, 980).join('\n'));
