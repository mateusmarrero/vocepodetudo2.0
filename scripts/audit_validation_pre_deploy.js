const http = require('http');
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const ROOT_DIR = 'C:\\Users\\usuario\\Downloads\\VCPDTD ANTIGRAVITY';
const PORT = 8998;
const HOST = '127.0.0.1';
const BASE_URL = `http://${HOST}:${PORT}`;

// Helper para gerar tokens de teste
function createTestToken(payloadObj, secret = 'vpt_secret_serverbyte_2026_super_secure_key_brasilll!') {
  const header = Buffer.from(JSON.stringify({ typ: 'JWT', alg: 'HS256' })).toString('base64');
  const payload = Buffer.from(JSON.stringify(payloadObj)).toString('base64');
  const signature = crypto.createHmac('sha256', secret).update(`${header}.${payload}`).digest('hex');
  return `${header}.${payload}.${signature}`;
}

function makeRequest(urlPath, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlPath, BASE_URL);
    const reqOptions = {
      hostname: HOST,
      port: PORT,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function runAudit() {
  console.log('====================================================================');
  console.log(' VALIDAÇÃO FINAL DE SEGURANÇA E DIAGNÓSTICO PRÉ-DEPLOY (PHP 8.3) ');
  console.log('====================================================================\n');

  const server = spawn('php', ['-S', `${HOST}:${PORT}`, '-t', ROOT_DIR], {
    cwd: ROOT_DIR,
    stdio: 'ignore'
  });
  await new Promise(r => setTimeout(r, 1200));

  const testResults = [];

  function recordTest(id, name, expected, obtained, pass) {
    testResults.push({ id, name, expected, obtained, pass });
    console.log(`[${pass ? 'PASS' : 'FAIL'}] Teste #${id}: ${name} -> Esperado: ${expected} | Obtido: ${obtained}`);
  }

  try {
    const posts = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'api', 'cache_blog.json'), 'utf8'));
    const now = new Date();
    const publishedPosts = posts.filter(p => Number(p.is_published) === 1 && new Date(p.created_at.replace(/-/g, '/')) <= now);
    const scheduledPosts = posts.filter(p => Number(p.is_published) === 1 && new Date(p.created_at.replace(/-/g, '/')) > now);

    const pubSample = publishedPosts[0];
    const schedSample = scheduledPosts.find(p => p.id === 136) || scheduledPosts[0];

    // T01: Artigo publicado acessado anonimamente por slug
    const r1 = await makeRequest(`/artigo.php?slug=${pubSample.slug}`);
    recordTest(1, 'Artigo publicado via slug (Anônimo)', 'HTTP 200', `HTTP ${r1.statusCode}`, r1.statusCode === 200);

    // T02: Artigo publicado - Presença do título original
    recordTest(2, 'Artigo publicado - Exibição do título', 'Título presente', r1.body.includes(pubSample.title) ? 'Título presente' : 'Ausente', r1.body.includes(pubSample.title));

    // T03: Artigo publicado - Meta robots index, follow
    recordTest(3, 'Artigo publicado - Meta robots index, follow', 'index, follow', r1.body.includes('index, follow') ? 'index, follow' : 'Outro', r1.body.includes('index, follow'));

    // T04: Artigo publicado - Schema.org NewsArticle
    recordTest(4, 'Artigo publicado - Schema.org NewsArticle', 'NewsArticle presente', r1.body.includes('"@type": "NewsArticle"') ? 'NewsArticle presente' : 'Ausente', r1.body.includes('"@type": "NewsArticle"'));

    // T05: Artigo publicado - Sem banner de preview
    recordTest(5, 'Artigo publicado - Ausência de banner de preview', 'Sem banner', !r1.body.includes('Modo de Pré-visualização') ? 'Sem banner' : 'Banner presente', !r1.body.includes('Modo de Pré-visualização'));

    // T06: Artigo publicado - Cabeçalho Cache-Control público
    recordTest(6, 'Artigo publicado - Cache-Control público', 'public, max-age=3600', r1.headers['cache-control'] || 'ausente', (r1.headers['cache-control'] || '').includes('public'));

    // T07: Artigo agendado acessado anonimamente por slug
    const r2 = await makeRequest(`/artigo.php?slug=${schedSample.slug}`);
    recordTest(7, 'Artigo agendado via slug (Anônimo)', 'HTTP 404', `HTTP ${r2.statusCode}`, r2.statusCode === 404);

    // T08: Artigo agendado - Ocultação do título para anônimo
    recordTest(8, 'Artigo agendado - Ocultação do título (Anônimo)', 'Título ocultado', !r2.body.includes(schedSample.title) ? 'Título ocultado' : 'Título vazado', !r2.body.includes(schedSample.title));

    // T09: Artigo agendado - Ocultação do conteúdo para anônimo
    recordTest(9, 'Artigo agendado - Ocultação do conteúdo (Anônimo)', 'Conteúdo ocultado', !r2.body.includes(schedSample.content.substring(0, 40)) ? 'Conteúdo ocultado' : 'Conteúdo vazado', !r2.body.includes(schedSample.content.substring(0, 40)));

    // T10: Artigo agendado - Ausência de Schema.org NewsArticle
    recordTest(10, 'Artigo agendado - Ausência de Schema NewsArticle', 'Sem NewsArticle', !r2.body.includes('"@type": "NewsArticle"') ? 'Sem NewsArticle' : 'Schema presente', !r2.body.includes('"@type": "NewsArticle"'));

    // T11: Artigo agendado - Cabeçalho Cache-Control anti-cache (para não travar publicação)
    recordTest(11, 'Artigo agendado 404 - Cache-Control anti-cache', 'no-cache / no-store / max-age=0', r2.headers['cache-control'] || 'ausente', (r2.headers['cache-control'] || '').includes('no-store'));

    // T12: Artigo agendado acessado anonimamente por ID
    const r3 = await makeRequest(`/artigo.php?slug=${schedSample.id}`);
    recordTest(12, 'Artigo agendado via ID (Anônimo)', 'HTTP 404', `HTTP ${r3.statusCode}`, r3.statusCode === 404);

    // T13: Artigo agendado por ID - Título ocultado
    recordTest(13, 'Artigo agendado via ID - Título ocultado', 'Título ocultado', !r3.body.includes(schedSample.title) ? 'Título ocultado' : 'Título vazado', !r3.body.includes(schedSample.title));

    // T14: Artigo inexistente
    const r4 = await makeRequest('/artigo.php?slug=artigo-inexistente-xyz-999');
    recordTest(14, 'Artigo inexistente', 'HTTP 404', `HTTP ${r4.statusCode}`, r4.statusCode === 404);

    // T15: Artigo agendado - Admin autenticado com role='admin'
    const adminToken = createTestToken({ user: 'admin_test', role: 'admin', exp: Math.floor(Date.now() / 1000) + 3600 });
    const r5 = await makeRequest(`/artigo.php?slug=${schedSample.slug}`, {
      headers: { 'Cookie': `vpt_auth_token=${adminToken}` }
    });
    recordTest(15, 'Artigo agendado - Admin Autenticado', 'HTTP 200', `HTTP ${r5.statusCode}`, r5.statusCode === 200);

    // T16: Artigo agendado - Admin consegue ler título
    recordTest(16, 'Artigo agendado - Admin lê título', 'Título exibido', r5.body.includes(schedSample.title) ? 'Título exibido' : 'Ausente', r5.body.includes(schedSample.title));

    // T17: Artigo agendado - Banner visual de pré-visualização administrativa
    recordTest(17, 'Artigo agendado - Banner de preview visível', 'Banner presente', r5.body.includes('Modo de Pré-visualização') ? 'Banner presente' : 'Ausente', r5.body.includes('Modo de Pré-visualização'));

    // T18: Artigo agendado - Meta robots noindex, nofollow, noarchive
    recordTest(18, 'Artigo agendado - Meta robots noindex', 'noindex, nofollow, noarchive', r5.body.includes('noindex, nofollow, noarchive') ? 'noindex, nofollow, noarchive' : 'Outro', r5.body.includes('noindex, nofollow, noarchive'));

    // T19: Artigo agendado - Cabeçalho X-Robots-Tag: noindex
    recordTest(19, 'Artigo agendado - Cabeçalho X-Robots-Tag', 'noindex', r5.headers['x-robots-tag'] || 'ausente', (r5.headers['x-robots-tag'] || '').includes('noindex'));

    // T20: Artigo agendado - Cabeçalho Cache-Control: private, no-store
    recordTest(20, 'Artigo agendado - Cache-Control private anti-cache', 'private, no-store', r5.headers['cache-control'] || 'ausente', (r5.headers['cache-control'] || '').includes('private'));

    // T21: Artigo agendado - Ausência de Schema NewsArticle público em preview
    recordTest(21, 'Artigo agendado - NewsArticle suprimido em preview', 'Sem NewsArticle', !r5.body.includes('"@type": "NewsArticle"') ? 'Sem NewsArticle' : 'Schema vazado', !r5.body.includes('"@type": "NewsArticle"'));

    // T22: Tentativa de acesso com token de estudante
    const studentToken = createTestToken({ sub: 1234, name: 'Aluno Teste', role: 'student', exp: Math.floor(Date.now() / 1000) + 3600 }, 'vpt_student_secret_serverbyte_2026_isolated_student_key!');
    const rStudent = await makeRequest(`/artigo.php?slug=${schedSample.slug}`, {
      headers: { 'Cookie': `vpt_auth_token=${studentToken}` }
    });
    recordTest(22, 'Artigo agendado com Token de Estudante', 'HTTP 404 (Acesso Negado à Prévia)', `HTTP ${rStudent.statusCode}`, rStudent.statusCode === 404);

    // T23: Tentativa de acesso com token sem role (papel implícito rejeitado)
    const implicitToken = createTestToken({ user: 'attacker_no_role', exp: Math.floor(Date.now() / 1000) + 3600 });
    const rImplicit = await makeRequest(`/artigo.php?slug=${schedSample.slug}`, {
      headers: { 'Cookie': `vpt_auth_token=${implicitToken}` }
    });
    recordTest(23, 'Artigo agendado com Token Sem Role (Sem Papel Implícito)', 'HTTP 404 (Rejeitado)', `HTTP ${rImplicit.statusCode}`, rImplicit.statusCode === 404);

    // T24: Tentativa de acesso com token expirado
    const expiredToken = createTestToken({ user: 'admin_test', role: 'admin', exp: Math.floor(Date.now() / 1000) - 3600 });
    const rExpired = await makeRequest(`/artigo.php?slug=${schedSample.slug}`, {
      headers: { 'Cookie': `vpt_auth_token=${expiredToken}` }
    });
    recordTest(24, 'Artigo agendado com Token Expirado', 'HTTP 404 (Rejeitado)', `HTTP ${rExpired.statusCode}`, rExpired.statusCode === 404);

    // T25: Tentativa de acesso com token de assinatura adulterada
    const forgedToken = adminToken.substring(0, adminToken.length - 6) + 'abcdef';
    const rForged = await makeRequest(`/artigo.php?slug=${schedSample.slug}`, {
      headers: { 'Cookie': `vpt_auth_token=${forgedToken}` }
    });
    recordTest(25, 'Artigo agendado com Token Assinatura Adulterada', 'HTTP 404 (Rejeitado)', `HTTP ${rForged.statusCode}`, rForged.statusCode === 404);

    // T26: Tentativa de contorno via parâmetro ?artigo=
    const rParamArt = await makeRequest(`/artigo.php?artigo=${schedSample.slug}`);
    recordTest(26, 'Tentativa de contorno via ?artigo=', 'HTTP 404', `HTTP ${rParamArt.statusCode}`, rParamArt.statusCode === 404);

    // T27: Tentativa de contorno via parâmetro ?p=
    const rParamP = await makeRequest(`/artigo.php?p=${schedSample.id}`);
    recordTest(27, 'Tentativa de contorno via ?p=', 'HTTP 404', `HTTP ${rParamP.statusCode}`, rParamP.statusCode === 404);

    // T28: api/blog.php?action=get por slug (Anônimo)
    const rApiSlug = await makeRequest(`/api/blog.php?action=get&slug=${schedSample.slug}`);
    recordTest(28, 'API blog.php?action=get por slug (Anônimo)', 'HTTP 404', `HTTP ${rApiSlug.statusCode}`, rApiSlug.statusCode === 404);

    // T29: api/blog.php?action=get por ID (Anônimo)
    const rApiId = await makeRequest(`/api/blog.php?action=get&id=${schedSample.id}`);
    recordTest(29, 'API blog.php?action=get por ID (Anônimo)', 'HTTP 404', `HTTP ${rApiId.statusCode}`, rApiId.statusCode === 404);

    // T30: Fuso Horário PHP configurado
    const phpTz = execSync('php -r "require \'C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/api/config.php\'; echo date_default_timezone_get();"', { encoding: 'utf8' }).trim();
    recordTest(30, 'Fuso Horário PHP Oficial', 'America/Sao_Paulo', phpTz, phpTz === 'America/Sao_Paulo');

    // T31: sitemap.php - Código HTTP
    const rSitemap = await makeRequest('/sitemap.php');
    recordTest(31, 'sitemap.php - Resposta HTTP', 'HTTP 200', `HTTP ${rSitemap.statusCode}`, rSitemap.statusCode === 200);

    // T32: sitemap.php - Total de URLs
    const sitemapUrls = rSitemap.body.match(/<loc>(.*?)<\/loc>/g) || [];
    recordTest(32, 'sitemap.php - Total de URLs', '49 URLs', `${sitemapUrls.length} URLs`, sitemapUrls.length === 49);

    // T33: sitemap.php - Páginas Estáticas
    const sitemapStatics = sitemapUrls.filter(u => !u.includes('/artigo/'));
    recordTest(33, 'sitemap.php - Páginas Estáticas', '21 páginas', `${sitemapStatics.length} páginas`, sitemapStatics.length === 21);

    // T34: sitemap.php - Artigos Publicados
    const sitemapBlogs = sitemapUrls.filter(u => u.includes('/artigo/'));
    recordTest(34, 'sitemap.php - Artigos Publicados', '28 artigos', `${sitemapBlogs.length} artigos`, sitemapBlogs.length === 28);

    // T35: sitemap.php - Ausência de Artigos Agendados
    recordTest(35, 'sitemap.php - Zero artigos agendados futuros', 'Ausente', !rSitemap.body.includes(schedSample.slug) ? 'Ausente' : 'Presente', !rSitemap.body.includes(schedSample.slug));

    // T36: sitemap.xml estático - Total de URLs
    const statSitemapContent = fs.readFileSync(path.join(ROOT_DIR, 'sitemap.xml'), 'utf8');
    const statSitemapUrls = statSitemapContent.match(/<loc>(.*?)<\/loc>/g) || [];
    recordTest(36, 'sitemap.xml estático - Total de URLs', '49 URLs', `${statSitemapUrls.length} URLs`, statSitemapUrls.length === 49);

    // T37: api/rss.php - Código HTTP
    const rRss = await makeRequest('/api/rss.php');
    recordTest(37, 'api/rss.php - Resposta HTTP', 'HTTP 200', `HTTP ${rRss.statusCode}`, rRss.statusCode === 200);

    // T38: api/rss.php - Total de itens publicados
    const rssItems = rRss.body.match(/<item>/g) || [];
    recordTest(38, 'api/rss.php - Total de itens publicados', '28 itens', `${rssItems.length} itens`, rssItems.length === 28);

    // T39: api/rss.php - Ausência de Artigos Agendados
    recordTest(39, 'api/rss.php - Zero artigos agendados futuros', 'Ausente', !rRss.body.includes(schedSample.slug) ? 'Ausente' : 'Presente', !rRss.body.includes(schedSample.slug));

    // T40: rss.xml estático - Total de itens publicados
    const statRssContent = fs.readFileSync(path.join(ROOT_DIR, 'rss.xml'), 'utf8');
    const statRssItems = statRssContent.match(/<item>/g) || [];
    recordTest(40, 'rss.xml estático - Total de itens publicados', '28 itens', `${statRssItems.length} itens`, statRssItems.length === 28);

    // T41: Integridade da Base (144/144 registros idênticos ao snapshot)
    const snapshotFile = path.join(ROOT_DIR, 'backups', 'pre_scheduled_fix_20261114', 'snapshot_144_records.json');
    const snapshotData = JSON.parse(fs.readFileSync(snapshotFile, 'utf8'));
    const snapMap = new Map();
    snapshotData.forEach(s => snapMap.set(Number(s.id), s));
    let snapMismatches = 0;
    posts.forEach(p => {
      const snap = snapMap.get(Number(p.id));
      if (!snap) { snapMismatches++; return; }
      const hash = crypto.createHash('sha256').update(p.content || '').digest('hex');
      if (snap.title !== p.title || snap.slug !== p.slug || snap.created_at !== p.created_at || snap.content_sha256 !== hash) {
        snapMismatches++;
      }
    });
    recordTest(41, 'Integridade dos 144 Registros (Títulos, Slugs, Datas, Conteúdo SHA-256)', '0 divergências', `${snapMismatches} divergências`, snapMismatches === 0);

    // T42: Validação exaustiva dos 116 artigos agendados (116/116 HTTP 404)
    let sched404Count = 0;
    for (const sp of scheduledPosts) {
      const r = await makeRequest(`/artigo.php?slug=${sp.slug}`);
      if (r.statusCode === 404 && !r.body.includes(sp.content.substring(0, 30))) {
        sched404Count++;
      }
    }
    recordTest(42, 'Validação Exaustiva dos 116 Artigos Agendados (Todos 404)', '116 de 116 em HTTP 404', `${sched404Count} de 116 em HTTP 404`, sched404Count === 116);

  } catch (err) {
    console.error('Erro no diagnóstico:', err);
  } finally {
    server.kill();
  }

  const passed = testResults.filter(t => t.pass).length;
  console.log(`\n====================================================================`);
  console.log(`TOTAL DE TESTES HOMOLOGADOS: ${passed} de ${testResults.length} APROVADOS (${Math.round(passed/testResults.length*100)}%)`);
  console.log(`====================================================================\n`);

  // Salvar resultado em JSON para inclusão no relatório
  fs.writeFileSync('C:\\Users\\usuario\\Downloads\\VCPDTD ANTIGRAVITY\\scripts\\validation_results_42.json', JSON.stringify(testResults, null, 2), 'utf8');
}

runAudit();
