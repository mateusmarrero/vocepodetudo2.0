const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\usuario\\Downloads\\VCPDTD ANTIGRAVITY';
const appJs = fs.readFileSync(path.join(dir, 'src', 'app.js'), 'utf8');

const lines = appJs.split('\n');
console.log('--- Lines 5850 to 5920 in app.js ---');
lines.slice(5850, 5920).forEach((l, i) => console.log((5850+i+1) + ': ' + l));
