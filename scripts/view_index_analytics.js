const fs = require('fs');

const index = fs.readFileSync('index.html', 'utf8');
const lines = index.split('\n');

const pos = lines.findIndex(l => l.includes('analytics-modal') || l.includes('Painel Analítico'));
console.log('Posição em index.html:', pos + 1);
console.log(lines.slice(pos, pos + 60).join('\n'));
