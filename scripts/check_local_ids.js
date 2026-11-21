const fs = require('fs');

const mk = fs.readFileSync('midia-kit.html', 'utf8');
console.log('midia-kit.html local:');
console.log('tabela-aluguel:', mk.includes('tabela-aluguel'));
console.log('gerador-proposta-card:', mk.includes('gerador-proposta-card'));
console.log('850,00:', mk.includes('850,00'));

// Onde está tabela-aluguel no local:
const idx = mk.indexOf('tabela-aluguel');
console.log('pos:', idx);
if (idx !== -1) {
  console.log(mk.slice(idx - 20, idx + 80));
}
