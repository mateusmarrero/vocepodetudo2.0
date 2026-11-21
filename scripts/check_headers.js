const https = require('https');

https.get('https://vocepodetudo.com/src/app.js?v=4.82.0', (res) => {
  console.log('Headers:', res.headers);
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    console.log('Length:', body.length);
    console.log('Last modified header:', res.headers['last-modified']);
    console.log('Contains renderHomeTrafficRealtimeChart:', body.includes('renderHomeTrafficRealtimeChart'));
    console.log('Contains toggleCourseCardExpansion:', body.includes('toggleCourseCardExpansion'));
  });
});
