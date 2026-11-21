const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\usuario\\Downloads\\VCPDTD ANTIGRAVITY';
const index = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');

const lines = index.split('\n');
console.log('--- Lines 1895 to 2135 ---');
lines.slice(1895, 2135).forEach((l, i) => console.log((1895+i+1) + ': ' + l));
