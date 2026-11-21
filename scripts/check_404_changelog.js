const https = require('https');

function check404(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      console.log(`${url} -> Status: ${res.statusCode}`);
      resolve(res.statusCode);
    }).on('error', err => resolve(null));
  });
}

async function run() {
  await check404('https://vocepodetudo.com/changelog.txt');
  await check404('https://vocepodetudo.com/CHANGELOG_COMPLETO_VOCEPODETUDO.txt');
}

run();
