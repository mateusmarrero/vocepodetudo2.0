const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
const lines = content.split('\n');
const start = lines.findIndex(l => l.includes('id="analytics-view-mediakit"'));
console.log(lines.slice(start + 70, start + 140).join('\n'));
