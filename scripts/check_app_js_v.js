const https = require('https');

https.get('https://vocepodetudo.com/src/app.js?v=4.82.0', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    console.log('src/app.js?v=4.82.0 status:', res.statusCode, 'length:', data.length);
    console.log('has renderHomeTrafficRealtimeChart:', data.includes('renderHomeTrafficRealtimeChart'));
    console.log('cf-cache-status:', res.headers['cf-cache-status']);
    if (res.statusCode !== 200) console.log('Response body:', data.slice(0, 300));
  });
}).on('error', e => console.error(e));
