const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\usuario\\Downloads\\VCPDTD ANTIGRAVITY';
const index = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');

const lines = index.split('\n');
console.log('--- Lines 1180 to 1270 ---');
lines.slice(1180, 1270).forEach((l, i) => console.log((1180+i+1) + ': ' + l));
