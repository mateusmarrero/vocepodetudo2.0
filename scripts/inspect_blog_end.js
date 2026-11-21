const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\usuario\\Downloads\\VCPDTD ANTIGRAVITY';
const appJs = fs.readFileSync(path.join(dir, 'src', 'app.js'), 'utf8');

const lines = appJs.split('\n');
console.log('--- Lines 6440 to 6520 in app.js ---');
lines.slice(6440, 6520).forEach((l, i) => console.log((6440+i+1) + ': ' + l));
