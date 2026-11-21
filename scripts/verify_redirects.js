const https = require('https');

function checkRedirect(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      console.log(`URL: ${url} -> Status: ${res.statusCode} | Location: ${res.headers.location}`);
      resolve(res.statusCode);
    }).on('error', (err) => {
      console.error(err);
      resolve(null);
    });
  });
}

async function run() {
  await checkRedirect('https://vocepodetudo.com/anuncie');
  await checkRedirect('https://vocepodetudo.com/publicidade');
  await checkRedirect('https://vocepodetudo.com/media-kit');
}
run();
