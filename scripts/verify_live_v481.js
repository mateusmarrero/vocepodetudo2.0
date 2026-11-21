const https = require('https');

https.get('https://vocepodetudo.com/midia-kit', (res) => {
  console.log(`Status: ${res.statusCode} ${res.statusMessage}`);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Tamanho recebido:', data.length, 'bytes');
    console.log('Contém tabela-aluguel:', data.includes('id="tabela-aluguel"'));
    console.log('Contém gerador-proposta-card:', data.includes('id="gerador-proposta-card"'));
    console.log('Contém updateProposalPreview:', data.includes('updateProposalPreview'));
    console.log('Contém R$ 850,00:', data.includes('850,00'));
    console.log('Contém R$ 650,00:', data.includes('650,00'));
  });
}).on('error', (err) => {
  console.error(err);
});
