const fs = require('fs');

const adminJs = fs.readFileSync('src/admin.js', 'utf8');
const lines = adminJs.split('\n');

const pos = lines.findIndex(l => l.includes('function renderAnalyticsUI('));
console.log('Posição em src/admin.js:', pos + 1);
console.log(lines.slice(pos, pos + 40).join('\n'));
