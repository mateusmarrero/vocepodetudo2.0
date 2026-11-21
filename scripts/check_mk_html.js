const fs = require('fs');

const mk = fs.readFileSync('midia-kit.html', 'utf8');
console.log('Tamanho local:', mk.length);
console.log('Contém id="tabela-aluguel":', mk.includes('id="tabela-aluguel"'));
console.log('Contém id="gerador-proposta-card":', mk.includes('id="gerador-proposta-card"'));

if (mk.includes('id="tabela-aluguel"')) {
  console.log('Está no arquivo local!');
} else {
  console.log('NÃO está no arquivo local!');
}
