const fs = require('fs');

const content = fs.readFileSync('CHANGELOG_COMPLETO_VOCEPODETUDO.txt', 'utf8');
const lines = content.split('\n');

console.log('Linhas totais:', lines.length);
console.log('Primeiras 45 linhas:');
console.log(lines.slice(0, 45).join('\n'));
