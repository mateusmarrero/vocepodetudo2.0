const https = require('https');

function fetchBody(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchBody(res.headers.location).then(resolve);
      }
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, data }));
    }).on('error', err => resolve({ error: err.message }));
  });
}

async function run() {
  const admin = await fetchBody('https://vocepodetudo.com/admin');
  console.log('admin status:', admin.statusCode, 'has chart.umd:', admin.data?.includes('chart.umd.min.js'), 'has canvas:', admin.data?.includes('traffic-realtime-chart'));

  const app = await fetchBody('https://vocepodetudo.com/src/app.js?bust=' + Date.now());
  console.log('app.js status:', app.statusCode, 'has home chart:', app.data?.includes('renderHomeTrafficRealtimeChart'));
}

run();
