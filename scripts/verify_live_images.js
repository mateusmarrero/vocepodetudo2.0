const https = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, data: d }));
    }).on('error', reject);
  });
}

async function verify() {
  const index = await get('https://vocepodetudo.com/?t=' + Date.now());
  console.log('Index status:', index.status);
  const appJsMatch = index.data.match(/src="[^"]*app\.js[^"]*"/);
  console.log('app.js script tag in index.html:', appJsMatch ? appJsMatch[0] : 'NOT FOUND');

  const appJs = await get('https://vocepodetudo.com/src/app.js?v=4.33.1');
  console.log('app.js status:', appJs.status, 'len:', appJs.data.length);
  console.log('app.js contains courseImg?:', appJs.data.includes('courseImg'));

  const api = await get('https://vocepodetudo.com/api/courses.php?t=' + Date.now());
  const parsed = JSON.parse(api.data);
  console.log('Courses count from API:', parsed.courses ? parsed.courses.length : 0);
  console.log('Sample course images:', parsed.courses.slice(0, 3).map(c => ({ id: c.id, title: c.title, img: c.imageUrl })));
}

verify();
