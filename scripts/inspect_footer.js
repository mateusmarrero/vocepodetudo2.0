const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\usuario\\Downloads\\VCPDTD ANTIGRAVITY';
const index = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');

const lines = index.split('\n');
console.log('--- Lines 2130 to 2230 (Footer) ---');
lines.slice(2130, 2230).forEach((l, i) => console.log((2130+i+1) + ': ' + l));
