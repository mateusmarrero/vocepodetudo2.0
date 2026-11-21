const https = require('https');

console.log('🔄 Disparando sincronização do MySQL via api/blog.php?force_sync=1...');

const req = https.request('https://vocepodetudo.com/api/blog.php?force_sync=1', {
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) RescheduleSync/1.0'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('HTTP Status:', res.statusCode);
    try {
      const json = JSON.parse(data);
      console.log('Sucesso:', json.success);
      console.log('Total de artigos retornados para visitantes públicos:', json.total);
      console.log('Primeiro artigo retornado:', json.posts && json.posts[0] ? json.posts[0].title : 'Nenhum');
    } catch (e) {
      console.log('Resposta bruta (primeiros 300 chars):', data.slice(0, 300));
    }
  });
});

req.on('error', err => console.error('Erro na requisição:', err));
req.end();
