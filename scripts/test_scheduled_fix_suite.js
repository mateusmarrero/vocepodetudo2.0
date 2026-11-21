const http = require('http');
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const ROOT_DIR = 'C:\\Users\\usuario\\Downloads\\VCPDTD ANTIGRAVITY';
const PORT = 8999;
const HOST = '127.0.0.1';
const BASE_URL = `http://${HOST}:${PORT}`;

// Helper para gerar token JWT de admin válido
function generateAdminJwt() {
  const secret = 'vpt_secret_serverbyte_2026_super_secure_key_brasilll!';
  const header = Buffer.from(JSON.stringify({ typ: 'JWT', alg: 'HS256' })).toString('base64');
  const payload = Buffer.from(JSON.stringify({
    user: 'admin_test',
    role: 'admin',
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000)
  })).toString('base64');
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

async function runSuite() {
  console.log('================================================================');
  console.log(' SUÍTE DE TESTES OBRIGATÓRIOS — CORREÇÃO DE AGENDAMENTO DO BLOG ');
  console.log(' Portal Você Pode Tudo — Ambiente Local de Homologação PHP 8.3  ');
  console.log('================================================================\n');

  // Iniciar servidor PHP embutido
  console.log(`[1/10] Iniciando servidor PHP embutido em ${BASE_URL}...`);
  const server = spawn('php', ['-S', `${HOST}:${PORT}`, '-t', ROOT_DIR], {
    cwd: ROOT_DIR,
    stdio: 'ignore'
  });

  // Aguardar servidor inicializar
  await new Promise(r => setTimeout(r, 1200));

  let totalTests = 0;
  let passedTests = 0;
  const failures = [];

  function assert(condition, testName, details = '') {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  ✅ [PASS] ${testName}`);
    } else {
      failures.push({ testName, details });
      console.log(`  ❌ [FAIL] ${testName} -> ${details}`);
    }
  }

  try {
    // Carregar inventário e dados de snapshot
    const posts = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'api', 'cache_blog.json'), 'utf8'));
    const now = new Date();
    const publishedPosts = posts.filter(p => Number(p.is_published) === 1 && new Date(p.created_at.replace(/-/g, '/')) <= now);
    const scheduledPosts = posts.filter(p => Number(p.is_published) === 1 && new Date(p.created_at.replace(/-/g, '/')) > now);

    console.log(`\nBase de Dados: Total de ${posts.length} artigos (Publicados: ${publishedPosts.length}, Agendados: ${scheduledPosts.length})\n`);

    // =====================================================================
    // CENÁRIO 1: Artigo Publicado (Acesso Anônimo) -> HTTP 200
    // =====================================================================
    console.log('--- CENÁRIO 1: Artigo publicado acessado por visitante anônimo ---');
    const pubSample = publishedPosts[0]; // ID 144
    const res1 = await makeRequest(`/artigo.php?slug=${pubSample.slug}`);
    assert(res1.statusCode === 200, `Artigo publicado (${pubSample.slug}) deve retornar HTTP 200 (obteve ${res1.statusCode})`);
    assert(res1.body.includes(pubSample.title), 'Artigo publicado deve exibir o título original');
    assert(res1.body.includes('index, follow'), 'Artigo publicado deve conter meta robots index, follow');
    assert(res1.body.includes('"@type": "NewsArticle"'), 'Artigo publicado deve conter Schema.org NewsArticle');
    assert(!res1.body.includes('Modo de Pré-visualização Administrativa'), 'Artigo publicado NÃO deve conter banner de preview');

    // =====================================================================
    // CENÁRIO 2: Artigo Agendado por Slug (Acesso Anônimo) -> HTTP 404
    // =====================================================================
    console.log('\n--- CENÁRIO 2: Artigo agendado acessado por visitante anônimo (por slug) ---');
    const schedSample = scheduledPosts.find(p => p.id === 136) || scheduledPosts[0];
    const res2 = await makeRequest(`/artigo.php?slug=${schedSample.slug}`);
    assert(res2.statusCode === 404, `Artigo agendado (${schedSample.slug}) deve retornar HTTP 404 para anônimo (obteve ${res2.statusCode})`);
    assert(!res2.body.includes(schedSample.title), 'Artigo agendado NÃO deve vazar o título para anônimo');
    assert(!res2.body.includes(schedSample.content.substring(0, 50)), 'Artigo agendado NÃO deve vazar o conteúdo para anônimo');
    assert(!res2.body.includes('"@type": "NewsArticle"'), 'Artigo agendado NÃO deve conter Schema.org NewsArticle');
    assert(res2.body.includes('Ops! Artigo não encontrado') || res2.body.includes('404'), 'Deve renderizar página 404 padrão');

    // =====================================================================
    // CENÁRIO 3: Artigo Agendado por ID (Acesso Anônimo) -> HTTP 404
    // =====================================================================
    console.log('\n--- CENÁRIO 3: Artigo agendado acessado por ID (Acesso Anônimo) ---');
    const res3 = await makeRequest(`/artigo.php?slug=${schedSample.id}`);
    assert(res3.statusCode === 404, `Artigo agendado por ID (${schedSample.id}) deve retornar HTTP 404 para anônimo (obteve ${res3.statusCode})`);
    assert(!res3.body.includes(schedSample.title), 'Artigo agendado por ID NÃO deve vazar o título');

    // =====================================================================
    // CENÁRIO 4: Artigo Inexistente (Acesso Anônimo) -> HTTP 404
    // =====================================================================
    console.log('\n--- CENÁRIO 4: Artigo inexistente ---');
    const res4 = await makeRequest(`/artigo.php?slug=artigo-completamente-inexistente-xyz-999`);
    assert(res4.statusCode === 404, `Artigo inexistente deve retornar HTTP 404 (obteve ${res4.statusCode})`);
    assert(res4.body.includes('noindex'), 'Página 404 deve conter noindex');

    // =====================================================================
    // CENÁRIO 5: Artigo Agendado com Autenticação Administrativa -> HTTP 200 + Preview
    // =====================================================================
    console.log('\n--- CENÁRIO 5: Artigo agendado acessado por Administrador Autenticado ---');
    const adminToken = generateAdminJwt();
    const res5 = await makeRequest(`/artigo.php?slug=${schedSample.slug}`, {
      headers: {
        'Cookie': `vpt_auth_token=${adminToken}`
      }
    });
    assert(res5.statusCode === 200, `Admin autenticado deve acessar artigo agendado com HTTP 200 (obteve ${res5.statusCode})`);
    assert(res5.body.includes(schedSample.title), 'Admin deve conseguir ler o título do artigo agendado');
    assert(res5.body.includes('Modo de Pré-visualização Administrativa'), 'Admin deve ver banner de aviso de pré-visualização');
    assert(res5.body.includes('noindex, nofollow, noarchive'), 'Preview deve ter meta robots noindex, nofollow, noarchive');
    assert(res5.headers['x-robots-tag'] && res5.headers['x-robots-tag'].includes('noindex'), 'Preview deve enviar cabeçalho X-Robots-Tag: noindex');
    assert(res5.headers['cache-control'] && res5.headers['cache-control'].includes('private'), 'Preview deve ter Cache-Control: private');
    assert(!res5.body.includes('"@type": "NewsArticle"'), 'Preview NÃO deve incluir Schema.org NewsArticle público');

    // =====================================================================
    // CENÁRIO 6: Tentativa de contorno por parâmetros de URL alternativos
    // =====================================================================
    console.log('\n--- CENÁRIO 6: Tentativas de contorno de validação por anônimo ---');
    const res6a = await makeRequest(`/artigo.php?artigo=${schedSample.slug}`);
    assert(res6a.statusCode === 404, `Parâmetro alternativo ?artigo=${schedSample.slug} deve retornar 404 (obteve ${res6a.statusCode})`);

    const res6b = await makeRequest(`/artigo.php?p=${schedSample.id}`);
    assert(res6b.statusCode === 404, `Parâmetro alternativo ?p=${schedSample.id} deve retornar 404 (obteve ${res6b.statusCode})`);

    const res6c = await makeRequest(`/api/blog.php?action=get&slug=${schedSample.slug}`);
    assert(res6c.statusCode === 404, `api/blog.php?action=get&slug=${schedSample.slug} deve retornar 404 para anônimo (obteve ${res6c.statusCode})`);

    const res6d = await makeRequest(`/api/blog.php?action=get&id=${schedSample.id}`);
    assert(res6d.statusCode === 404, `api/blog.php?action=get&id=${schedSample.id} deve retornar 404 para anônimo (obteve ${res6d.statusCode})`);

    // =====================================================================
    // CENÁRIO 7: Fuso Horário de Brasília (America/Sao_Paulo)
    // =====================================================================
    console.log('\n--- CENÁRIO 7: Verificação do Fuso Horário oficial de Brasília ---');
    const tzCheckOutput = execSync('php -r "require \'C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/api/config.php\'; echo date_default_timezone_get();"', { encoding: 'utf8' });
    assert(tzCheckOutput.trim() === 'America/Sao_Paulo', `PHP timezone deve ser America/Sao_Paulo (obteve ${tzCheckOutput.trim()})`);

    // =====================================================================
    // CENÁRIO 8: Validação do Sitemap (Dinâmico e Estático)
    // =====================================================================
    console.log('\n--- CENÁRIO 8: Validação do Sitemap Dinâmico e Estático ---');
    const sitemapDynamicRes = await makeRequest('/sitemap.php');
    assert(sitemapDynamicRes.statusCode === 200, `sitemap.php deve responder HTTP 200 (obteve ${sitemapDynamicRes.statusCode})`);
    const dynUrls = sitemapDynamicRes.body.match(/<loc>(.*?)<\/loc>/g) || [];
    const dynBlogUrls = dynUrls.filter(u => u.includes('/artigo/'));
    const dynStaticUrls = dynUrls.filter(u => !u.includes('/artigo/'));

    assert(dynUrls.length === 49, `sitemap.php deve conter exatamente 49 URLs no total (obteve ${dynUrls.length})`);
    assert(dynStaticUrls.length === 21, `sitemap.php deve conter exatamente 21 páginas estáticas (obteve ${dynStaticUrls.length})`);
    assert(dynBlogUrls.length === 28, `sitemap.php deve conter exatamente 28 artigos publicados (obteve ${dynBlogUrls.length})`);
    assert(!sitemapDynamicRes.body.includes(schedSample.slug), `sitemap.php NÃO deve conter artigos agendados futuros (${schedSample.slug})`);

    // Validar sitemap.xml estático
    const sitemapStaticXml = fs.readFileSync(path.join(ROOT_DIR, 'sitemap.xml'), 'utf8');
    const statUrls = sitemapStaticXml.match(/<loc>(.*?)<\/loc>/g) || [];
    const statBlogUrls = statUrls.filter(u => u.includes('/artigo/'));
    assert(statUrls.length === 49, `sitemap.xml estático deve conter exatamente 49 URLs (obteve ${statUrls.length})`);
    assert(statBlogUrls.length === 28, `sitemap.xml estático deve conter exatamente 28 artigos publicados (obteve ${statBlogUrls.length})`);

    // =====================================================================
    // CENÁRIO 9: Validação do Feed RSS (Dinâmico e Estático)
    // =====================================================================
    console.log('\n--- CENÁRIO 9: Validação do Feed RSS Dinâmico e Estático ---');
    const rssDynamicRes = await makeRequest('/api/rss.php');
    assert(rssDynamicRes.statusCode === 200, `api/rss.php deve responder HTTP 200 (obteve ${rssDynamicRes.statusCode})`);
    const dynRssItems = rssDynamicRes.body.match(/<item>/g) || [];
    assert(dynRssItems.length === 28, `api/rss.php deve conter exatamente 28 itens publicados (obteve ${dynRssItems.length})`);
    assert(!rssDynamicRes.body.includes(schedSample.slug), `api/rss.php NÃO deve conter artigos agendados futuros (${schedSample.slug})`);

    const rssStaticXml = fs.readFileSync(path.join(ROOT_DIR, 'rss.xml'), 'utf8');
    const statRssItems = rssStaticXml.match(/<item>/g) || [];
    assert(statRssItems.length === 28, `rss.xml estático deve conter exatamente 28 itens (obteve ${statRssItems.length})`);

    // =====================================================================
    // CENÁRIO 10: Integridade dos 144 Registros contra Snapshot
    // =====================================================================
    console.log('\n--- CENÁRIO 10: Integridade e preservação dos 144 registros originais ---');
    const snapshotFile = path.join(ROOT_DIR, 'backups', 'pre_scheduled_fix_20261114', 'snapshot_144_records.json');
    const snapshotData = JSON.parse(fs.readFileSync(snapshotFile, 'utf8'));
    assert(snapshotData.length === 144, `Snapshot deve conter 144 registros (tem ${snapshotData.length})`);
    assert(posts.length === 144, `cache_blog.json atual deve conter 144 registros (tem ${posts.length})`);

    const snapMap = new Map();
    snapshotData.forEach(s => snapMap.set(Number(s.id), s));

    let mismatches = 0;
    posts.forEach(p => {
      const snap = snapMap.get(Number(p.id));
      if (!snap) {
        mismatches++;
        return;
      }
      const hash = crypto.createHash('sha256').update(p.content || '').digest('hex');
      if (snap.title !== p.title || snap.slug !== p.slug || snap.created_at !== p.created_at || snap.content_sha256 !== hash) {
        mismatches++;
      }
    });
    assert(mismatches === 0, `0 divergências entre snapshot e base atual (divergências: ${mismatches})`);

    // =====================================================================
    // TESTE EXAUSTIVO DOS 116 ARTIGOS AGENDADOS
    // =====================================================================
    console.log(`\n--- TESTE EXAUSTIVO DOS 116 ARTIGOS AGENDADOS (Todos devem retornar 404) ---`);
    let scheduledLeaks = 0;
    let scheduledTested = 0;

    for (const sp of scheduledPosts) {
      const res = await makeRequest(`/artigo.php?slug=${sp.slug}`);
      scheduledTested++;
      if (res.statusCode !== 404 || res.body.includes(sp.content.substring(0, 40))) {
        scheduledLeaks++;
        console.log(`  ❌ VAZAMENTO DETECTADO no ID ${sp.id} (${sp.slug}) -> HTTP ${res.statusCode}`);
      }
    }
    assert(scheduledLeaks === 0, `Todos os 116 artigos agendados retornaram HTTP 404 real (testados: ${scheduledTested}, vazamentos: ${scheduledLeaks})`);

    // =====================================================================
    // TESTE DOS 28 ARTIGOS PUBLICADOS
    // =====================================================================
    console.log(`\n--- TESTE DOS 28 ARTIGOS PUBLICADOS (Todos devem retornar 200) ---`);
    let publishedErrors = 0;
    let publishedTested = 0;

    for (const pp of publishedPosts) {
      const res = await makeRequest(`/artigo.php?slug=${pp.slug}`);
      publishedTested++;
      if (res.statusCode !== 200 || !res.body.includes(pp.title)) {
        publishedErrors++;
        console.log(`  ❌ ERRO no artigo publicado ID ${pp.id} (${pp.slug}) -> HTTP ${res.statusCode}`);
      }
    }
    assert(publishedErrors === 0, `Todos os 28 artigos publicados retornaram HTTP 200 e conteúdo íntegro (testados: ${publishedTested}, erros: ${publishedErrors})`);

  } catch (err) {
    console.error('Erro na execução da suíte:', err);
  } finally {
    // Encerrar servidor PHP
    server.kill();
    console.log('\n[Servidor de testes finalizado]');
  }

  console.log('\n================================================================');
  console.log(` RESULTADO FINAL DOS TESTES: ${passedTests} de ${totalTests} testes APROVADOS!`);
  if (failures.length > 0) {
    console.log(` ❌ ${failures.length} FALHAS ENCONTRADAS!`);
  } else {
    console.log(' 🎉 100% DE APROVAÇÃO EM TODOS OS CENÁRIOS E NAS 144 VALIDAÇÕES!');
  }
  console.log('================================================================\n');
}

runSuite();
