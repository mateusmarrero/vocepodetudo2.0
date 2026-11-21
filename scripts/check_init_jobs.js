const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\usuario\\Downloads\\VCPDTD ANTIGRAVITY';
const appJs = fs.readFileSync(path.join(dir, 'src', 'app.js'), 'utf8');

const lines = appJs.split('\n');
console.log('--- initJobsModule in app.js ---');
const idx = appJs.indexOf('async function initJobsModule');
if (idx !== -1) {
  console.log(appJs.slice(idx, idx + 1000));
}
