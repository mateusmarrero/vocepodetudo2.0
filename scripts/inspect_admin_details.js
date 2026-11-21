const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const adminJs = fs.readFileSync(path.join(ROOT, 'src', 'admin.js'), 'utf8');

const fetches = [];
const regex = /fetch\(\s*[`'"]([^`'"]+)[`'"]/g;
let match;
while ((match = regex.exec(adminJs)) !== null) {
  fetches.push(match[1]);
}

console.log('Endpoints chamados via fetch:');
console.log([...new Set(fetches)].join('\n'));
