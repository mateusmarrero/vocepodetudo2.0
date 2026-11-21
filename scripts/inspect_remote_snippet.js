const https = require('https');
const zlib = require('zlib');

const url = 'https://vocepodetudo.com/midia-kit?v=4.81.0&t=' + Date.now();
const req = https.get(url, {
  headers: { 
    'Accept-Encoding': 'gzip, deflate',
    'Cache-Control': 'no-cache'
  }
}, (res) => {
  let stream = res.headers['content-encoding'] === 'gzip' ? res.pipe(zlib.createGunzip()) : res;
  let data = '';
  stream.on('data', chunk => data += chunk);
  stream.on('end', () => {
    const idx = data.indexOf('Gerador Rápido de Proposta Comercial');
    console.log('Posição no HTML remoto:', idx);
    console.log(data.slice(idx - 150, idx + 250));
  });
});
