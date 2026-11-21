const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\usuario\\Downloads\\VCPDTD ANTIGRAVITY';
const index = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');

console.log('--- Last 40 lines of index.html ---');
const lines = index.split('\n');
lines.slice(lines.length - 40).forEach((l, i) => console.log((lines.length - 40 + i + 1) + ': ' + l));
