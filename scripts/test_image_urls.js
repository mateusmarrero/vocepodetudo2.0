const fs = require('fs');
const https = require('https');

const posts = JSON.parse(fs.readFileSync('api/seed_blog.json', 'utf8'));

// Pegar todas as URLs únicas
const uniqueUrls = [...new Set(posts.map(p => p.cover_image).filter(Boolean))];
console.log(`Testando ${uniqueUrls.length} URLs únicas de imagens de capa...`);

async function checkUrl(url) {
  return new Promise((resolve) => {
    try {
      const req = https.request(url, { method: 'HEAD', timeout: 8000 }, (res) => {
        resolve({ url, status: res.statusCode });
      });
      req.on('error', (err) => resolve({ url, status: 'ERROR', error: err.message }));
      req.on('timeout', () => {
        req.destroy();
        resolve({ url, status: 'TIMEOUT' });
      });
      req.end();
    } catch (e) {
      resolve({ url, status: 'EXCEPTION', error: e.message });
    }
  });
}

(async () => {
  const results = [];
  // Fazer em lotes de 10
  for (let i = 0; i < uniqueUrls.length; i += 10) {
    const chunk = uniqueUrls.slice(i, i + 10);
    const chunkResults = await Promise.all(chunk.map(checkUrl));
    results.push(...chunkResults);
    process.stdout.write(`Progresso: ${Math.min(i + 10, uniqueUrls.length)}/${uniqueUrls.length}\r`);
  }
  console.log('\n--- Resultado do teste das URLs ---');
  const failed = results.filter(r => r.status !== 200 && r.status !== 301 && r.status !== 302);
  console.log(`Falhas (${failed.length}):`);
  failed.forEach(f => console.log(`  [${f.status}] ${f.url}`));

  if (failed.length === 0) {
    console.log('Todas as URLs de imagem responderam com sucesso!');
  }
})();
