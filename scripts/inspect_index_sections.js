const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\usuario\\Downloads\\VCPDTD ANTIGRAVITY';
const index = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');

const lines = index.split('\n');
console.log('--- Lines 3470 to 3530 ---');
lines.slice(3470, 3530).forEach((l, i) => console.log((3470+i+1) + ': ' + l));
