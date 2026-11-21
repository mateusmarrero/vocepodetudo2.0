const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\usuario\\Downloads\\VCPDTD ANTIGRAVITY';
const index = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');

const lines = index.split('\n');
console.log('--- Lines 1885 to 1900 ---');
lines.slice(1885, 1900).forEach((l, i) => console.log((1885+i+1) + ': ' + l));

console.log('--- Lines 2090 to 2105 ---');
lines.slice(2090, 2105).forEach((l, i) => console.log((2090+i+1) + ': ' + l));
