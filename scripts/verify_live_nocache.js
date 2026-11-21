const https = require('https');
const zlib = require('zlib');

const url = 'https://vocepodetudo.com/midia-kit?v=4.81.0&t=' + Date.now();
const req = https.get(url, {
  headers: { 
    'Accept-Encoding': 'gzip, deflate',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  }
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
    console.log('Contém id="tabela-aluguel":', data.includes('id="tabela-aluguel"'));
    console.log('Contém id="gerador-proposta-card":', data.includes('id="gerador-proposta-card"'));
    console.log('Contém Gerador Rápido de Proposta Comercial:', data.includes('Gerador Rápido de Proposta Comercial'));
  });
});
req.on('error', console.error);
