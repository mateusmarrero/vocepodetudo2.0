const fs = require('fs');
const path = require('path');

function searchInDir(dir, query) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        searchInDir(fullPath, query);
      }
    } else {
      try {
        const text = fs.readFileSync(fullPath, 'utf8');
        if (text.toLowerCase().includes(query.toLowerCase())) {
          console.log(`Encontrado em: ${fullPath}`);
          const lines = text.split('\n');
          lines.forEach((line, idx) => {
            if (line.toLowerCase().includes(query.toLowerCase())) {
              console.log(`  L${idx + 1}: ${line.trim().slice(0, 120)}`);
            }
          });
        }
      } catch (e) {}
    }
  }
}

console.log('--- Buscando "sobrevivencia" ---');
searchInDir('.', 'sobrevivencia');
console.log('--- Buscando "sobrevivência" ---');
searchInDir('.', 'sobrevivência');
console.log('--- Buscando "aluguel" ---');
searchInDir('.', 'aluguel');
