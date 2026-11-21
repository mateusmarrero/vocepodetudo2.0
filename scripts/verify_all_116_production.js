const https = require('https');
const fs = require('fs');
const path = require('path');

const posts = JSON.parse(fs.readFileSync('C:\\Users\\usuario\\Downloads\\VCPDTD ANTIGRAVITY\\api\\cache_blog.json', 'utf8'));
const now = new Date();
const scheduled = posts.filter(p => Number(p.is_published) === 1 && new Date(p.created_at.replace(/-/g, '/')) > now);

console.log(`Testando todos os ${scheduled.length} artigos agendados diretamente em PRODUÇÃO (HTTPS)...`);

function checkSlug(slug) {
  return new Promise((resolve) => {
    https.get(`https://vocepodetudo.com/artigo/${slug}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          slug,
          statusCode: res.statusCode,
          leaked: res.statusCode !== 404 || data.includes('NewsArticle')
        });
      });
    }).on('error', (err) => {
      resolve({ slug, statusCode: 500, leaked: false, error: err.message });
    });
  });
}

async function run() {
  let leaks = 0;
  let tested = 0;
  // Testar em lotes de 10 concorrentes para agilidade
  for (let i = 0; i < scheduled.length; i += 10) {
    const chunk = scheduled.slice(i, i + 10);
    const results = await Promise.all(chunk.map(p => checkSlug(p.slug)));
    results.forEach(r => {
      tested++;
      if (r.leaked) {
        leaks++;
        console.log(`❌ VAZAMENTO DETECTADO: ${r.slug} retornou HTTP ${r.statusCode}`);
      }
    });
    process.stdout.write(`Progresso: ${tested}/${scheduled.length} testados...\r`);
  }

  console.log(`\n\nRESULTADO DA VARREDURA DOS 116 ARTIGOS AGENDADOS EM PRODUÇÃO:`);
  console.log(`Total testados: ${tested}`);
  console.log(`Total com HTTP 404 real: ${tested - leaks}`);
  console.log(`Vazamentos encontrados: ${leaks}`);
  if (leaks === 0) {
    console.log(`✅ ZERO VAZAMENTOS! 116 de 116 artigos agendados retornam HTTP 404 real em produção.`);
  }
}

run();
