const https = require('https');

function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      console.log(`URL: ${url} -> Status: ${res.statusCode} ${res.statusMessage}`);
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const hasTitle = data.includes('Mídia Kit & Publicidade');
        const hasLiveAnalytics = data.includes('kpi-home-views');
        console.log(`- Contém título: ${hasTitle}`);
        console.log(`- Contém KPIs: ${hasLiveAnalytics}`);
        console.log(`- Tamanho recebido: ${data.length} bytes\n`);
        resolve(res.statusCode);
      });
    }).on('error', (err) => {
      console.error(`Erro ao acessar ${url}:`, err.message);
      resolve(null);
    });
  });
}

async function run() {
  console.log('--- TESTANDO URLS DE PRODUÇÃO EM VOCEPODETUDO.COM ---');
  await checkUrl('https://vocepodetudo.com/midia-kit');
  await checkUrl('https://vocepodetudo.com/midia-kit.html');
}

run();
