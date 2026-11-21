const https = require('https');
const zlib = require('zlib');

const req = https.get('https://vocepodetudo.com/midia-kit', {
  headers: { 'Accept-Encoding': 'gzip, deflate' }
}, (res) => {
  console.log(`Status: ${res.statusCode} | Encoding: ${res.headers['content-encoding']}`);
  let stream = res;
  if (res.headers['content-encoding'] === 'gzip') {
    stream = res.pipe(zlib.createGunzip());
  } else if (res.headers['content-encoding'] === 'deflate') {
    stream = res.pipe(zlib.createInflate());
  }
  let data = '';
  stream.on('data', chunk => data += chunk);
  stream.on('end', () => {
    console.log('Tamanho descomprimido:', data.length, 'bytes');
    console.log('Contém tabela-aluguel:', data.includes('id="tabela-aluguel"'));
    console.log('Contém gerador-proposta-card:', data.includes('id="gerador-proposta-card"'));
    console.log('Contém updateProposalPreview:', data.includes('updateProposalPreview'));
    console.log('Contém R$ 850,00:', data.includes('850,00'));
    console.log('Contém R$ 650,00:', data.includes('650,00'));
  });
});
req.on('error', console.error);
