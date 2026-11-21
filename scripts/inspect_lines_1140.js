const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\usuario\\Downloads\\VCPDTD ANTIGRAVITY';
const index = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');

const lines = index.split('\n');
console.log('--- Lines 1140 to 1200 ---');
lines.slice(1140, 1200).forEach((l, i) => console.log((1140+i+1) + ': ' + l));
