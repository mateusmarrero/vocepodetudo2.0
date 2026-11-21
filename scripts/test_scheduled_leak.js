const https = require('https');

const options = {
  hostname: 'vocepodetudo.com',
  path: '/artigo/como-transformar-habilidade-pessoal-em-fonte-de-renda',
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
  }
};

https.get(options, (res) => {
  console.log('STATUS CODE:', res.statusCode);
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    console.log('BODY LENGTH:', data.length);
    const mRobots = data.match(/<meta name="robots" content="([^"]+)"/i);
    const mCanonical = data.match(/<link rel="canonical" href="([^"]+)"/i);
    const mTitle = data.match(/<title>([^<]+)<\/title>/i);
    const mNewsArticle = data.includes('"@type": "NewsArticle"');
    console.log('ROBOTS:', mRobots ? mRobots[1] : 'none');
    console.log('CANONICAL:', mCanonical ? mCanonical[1] : 'none');
    console.log('TITLE:', mTitle ? mTitle[1] : 'none');
    console.log('NEWSARTICLE SCHEMA:', mNewsArticle);
  });
});
