const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\usuario\\Downloads\\VCPDTD ANTIGRAVITY';
const appJs = fs.readFileSync(path.join(dir, 'src', 'app.js'), 'utf8');

const lines = appJs.split('\n');
console.log('--- Lines 6150 to 6210 in app.js ---');
lines.slice(6150, 6210).forEach((l, i) => console.log((6150+i+1) + ': ' + l));
