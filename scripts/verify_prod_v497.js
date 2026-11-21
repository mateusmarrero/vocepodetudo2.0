const https = require('https');

function check(url) {
  return new Promise(resolve => {
    https.get(url + '?t=' + Date.now(), res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        console.log('\n=== ' + url + ' ===');
        console.log('Status:', res.statusCode);
        console.log('Cache-Control:', res.headers['cache-control']);
        console.log('Length:', data.length);
        if (url.endsWith('sw.js')) {
          const match = data.match(/vocepodetudo-pwa-v[0-9\.]+/);
          console.log('SW Cache Name:', match ? match[0] : 'not found');
          console.log('Includes admin bypass?', data.includes('admin'));
        }
        if (url.endsWith('admin.html')) {
          console.log('Admin has style.css?', data.includes('src/style.css'));
          console.log('Admin has v4.9.7?', data.includes('v=4.9.7'));
          console.log('Admin has tab-btn-resumes in map?', data.includes('tab-btn-resumes'));
        }
        if (url.endsWith('curriculo.html')) {
          console.log('Curriculo has v4.9.7?', data.includes('v=4.9.7'));
          console.log('Curriculo has curriculo.css?', data.includes('curriculo.css'));
        }
        resolve();
      });
    }).on('error', err => {
      console.error(url, err.message);
      resolve();
    });
  });
}

async function main() {
  await check('https://vocepodetudo.com/sw.js');
  await check('https://vocepodetudo.com/admin.html');
  await check('https://vocepodetudo.com/curriculo.html');
}
main();
