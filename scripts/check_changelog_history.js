const fs = require('fs');

const changelog = fs.readFileSync('CHANGELOG.md', 'utf8');
const lines = changelog.split('\n');
console.log('Total de linhas em CHANGELOG.md:', lines.length);

// Listar todas as versões encontradas no CHANGELOG.md
const versions = [];
lines.forEach((l, idx) => {
  if (l.startsWith('## [')) {
    versions.push({ line: idx + 1, title: l.trim() });
  }
});

console.log(`Total de versões documentadas: ${versions.length}`);
versions.forEach(v => console.log(`L${v.line}: ${v.title}`));
