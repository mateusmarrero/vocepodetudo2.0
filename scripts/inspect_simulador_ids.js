const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'simulador-entrevista.html'), 'utf8');

// Listar todos os IDs da página
const idMatches = [...html.matchAll(/id="([^"]+)"/g)].map(m => m[1]);
console.log('IDs encontrados em simulador-entrevista.html:', idMatches);
