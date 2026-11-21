const fs = require('fs');

const mk = fs.readFileSync('midia-kit.html', 'utf8');
const lines = mk.split('\n');

console.log(lines.slice(930, 990).join('\n'));
