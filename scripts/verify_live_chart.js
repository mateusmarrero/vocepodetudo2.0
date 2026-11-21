const https = require('https');

function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({ url, statusCode: res.statusCode, length: body.length, body });
      });
    }).on('error', (err) => resolve({ url, error: err.message }));
  });
}

async function verifyLive() {
  console.log('--- Verificando Servidor de Produção vocepodetudo.com ---');
  
  const adminRes = await checkUrl('https://vocepodetudo.com/admin.html?v=' + Date.now());
  console.log('admin.html status:', adminRes.statusCode, 'length:', adminRes.length);
  console.log('admin.html has chart.umd:', adminRes.body?.includes('chart.umd.min.js'));
  console.log('admin.html has canvas:', adminRes.body?.includes('traffic-realtime-chart'));

  const homeRes = await checkUrl('https://vocepodetudo.com/?v=' + Date.now());
  console.log('index.html status:', homeRes.statusCode, 'length:', homeRes.length);
  console.log('index.html has chart.umd:', homeRes.body?.includes('chart.umd.min.js'));
  console.log('index.html has modal canvas:', homeRes.body?.includes('home-analytics-traffic-chart'));

  const changelogTxtRes = await checkUrl('https://vocepodetudo.com/CHANGELOG_COMPLETO_VOCEPODETUDO.txt');
  console.log('CHANGELOG_COMPLETO_VOCEPODETUDO.txt status (deve ser 404):', changelogTxtRes.statusCode);

  const appJsRes = await checkUrl('https://vocepodetudo.com/src/app.js?v=4.82.0');
  console.log('app.js status:', appJsRes.statusCode, 'has home chart:', appJsRes.body?.includes('renderHomeTrafficRealtimeChart'));

  const adminJsRes = await checkUrl('https://vocepodetudo.com/src/admin.js?v=4.82.0');
  console.log('admin.js status:', adminJsRes.statusCode, 'has realtime chart:', adminJsRes.body?.includes('renderTrafficRealtimeChart'));
}

verifyLive();
