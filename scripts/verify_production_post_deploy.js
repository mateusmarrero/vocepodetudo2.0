const https = require('https');
const crypto = require('crypto');

function makeHttpsRequest(urlPath, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlPath, 'https://vocepodetudo.com');
    const reqOptions = {
      hostname: 'vocepodetudo.com',
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        ...(options.headers || {})
      }
    };

    const req = https.request(reqOptions, (res) => {
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

function createTestToken(payloadObj, secret = 'vpt_secret_serverbyte_2026_super_secure_key_brasilll!') {
  const header = Buffer.from(JSON.stringify({ typ: 'JWT', alg: 'HS256' })).toString('base64');
  const payload = Buffer.from(JSON.stringify(payloadObj)).toString('base64');
  const signature = crypto.createHmac('sha256', secret).update(`${header}.${payload}`).digest('hex');
  return `${header}.${payload}.${signature}`;
}

async function runProductionAudit() {
  console.log('========================================================================');
  console.log(' AUDITORIA PÓS-DEPLOY EM PRODUÇÃO (HTTPS REAL) — VOCÊ PODE TUDO ');
  console.log('========================================================================\n');

  let passes = 0;
  let total = 0;

  function assert(condition, name, details = '') {
    total++;
    if (condition) {
      passes++;
      console.log(`  ✅ [PASS] ${name}`);
    } else {
      console.log(`  ❌ [FAIL] ${name} -> ${details}`);
    }
  }

  try {
    // 1. Artigo Publicado (ID 21 / depois-dos-40-anos...)
    console.log('[1/8] Verificando Artigo Publicado em Produção...');
    const rPub = await makeHttpsRequest('/artigo/depois-dos-40-anos-como-recomecar-e-se-recolocar-no-mercado');
    assert(rPub.statusCode === 200, 'Artigo publicado retorna HTTP 200', `HTTP ${rPub.statusCode}`);
    assert(rPub.body.includes('Depois dos 40 Anos'), 'Artigo publicado contém o título correto');
    assert(rPub.body.includes('index, follow'), 'Artigo publicado contém robots index, follow');
    assert(rPub.body.includes('"@type": "NewsArticle"'), 'Artigo publicado contém Schema NewsArticle');
    assert(!rPub.body.includes('Modo de Pré-visualização'), 'Artigo publicado não exibe banner de preview');

    // 2. Artigo Agendado (ID 136 - como-transformar-habilidade...)
    console.log('\n[2/8] Verificando Artigo Agendado (Acesso Anônimo) em Produção...');
    const rSched = await makeHttpsRequest('/artigo/como-transformar-habilidade-pessoal-em-fonte-de-renda');
    assert(rSched.statusCode === 404, 'Artigo agendado (por slug) retorna HTTP 404 real', `HTTP ${rSched.statusCode}`);
    assert(!rSched.body.includes('Como Transformar uma Habilidade'), 'Artigo agendado NÃO vaza o título para anônimo');
    assert(!rSched.body.includes('"@type": "NewsArticle"'), 'Artigo agendado NÃO contém Schema NewsArticle');
    assert(rSched.body.includes('Artigo não encontrado') || rSched.body.includes('404'), 'Página 404 renderizada corretamente');

    // 3. Artigo Agendado acessado por ID
    console.log('\n[3/8] Verificando Tentativas de Contorno por ID ou Parâmetros em Produção...');
    const rSchedId = await makeHttpsRequest('/artigo.php?slug=136');
    assert(rSchedId.statusCode === 404, 'Artigo agendado por ID retorna HTTP 404', `HTTP ${rSchedId.statusCode}`);
    assert(!rSchedId.body.includes('Como Transformar uma Habilidade'), 'Artigo agendado por ID NÃO vaza título');

    const rParamP = await makeHttpsRequest('/artigo.php?p=136');
    assert(rParamP.statusCode === 404, 'Artigo agendado via ?p=136 retorna HTTP 404', `HTTP ${rParamP.statusCode}`);

    const rApiSched = await makeHttpsRequest('/api/blog.php?action=get&slug=como-transformar-habilidade-pessoal-em-fonte-de-renda');
    assert(rApiSched.statusCode === 404, 'API blog.php?action=get em post agendado retorna HTTP 404 para anônimo', `HTTP ${rApiSched.statusCode}`);

    // 4. Pré-visualização Administrativa Autenticada
    console.log('\n[4/8] Verificando Pré-visualização Administrativa (com JWT) em Produção...');
    const adminToken = createTestToken({ user: 'admin', role: 'admin', exp: Math.floor(Date.now() / 1000) + 3600 });
    const rAdminPreview = await makeHttpsRequest('/artigo/como-transformar-habilidade-pessoal-em-fonte-de-renda', {
      headers: { 'Cookie': `vpt_auth_token=${adminToken}` }
    });
    assert(rAdminPreview.statusCode === 200, 'Admin autenticado acessa artigo agendado com HTTP 200', `HTTP ${rAdminPreview.statusCode}`);
    assert(rAdminPreview.body.includes('Como Transformar uma Habilidade'), 'Admin consegue visualizar o artigo agendado');
    assert(rAdminPreview.body.includes('Modo de Pré-visualização Administrativa'), 'Banner de pré-visualização administrativa exibido para o admin');
    assert(rAdminPreview.body.includes('noindex, nofollow, noarchive'), 'Meta robots do preview é noindex, nofollow, noarchive');
    assert((rAdminPreview.headers['x-robots-tag'] || '').includes('noindex'), 'Cabeçalho HTTP X-Robots-Tag: noindex presente');
    assert((rAdminPreview.headers['cache-control'] || '').includes('private'), 'Cabeçalho Cache-Control: private presente');
    assert(!rAdminPreview.body.includes('"@type": "NewsArticle"'), 'Schema NewsArticle público omitido no preview');

    // 5. Tentativa com token inválido / estudante
    console.log('\n[5/8] Verificando Rejeição de Tokens de Estudante / Inválidos em Produção...');
    const studentToken = createTestToken({ sub: 999, role: 'student', exp: Math.floor(Date.now() / 1000) + 3600 }, 'vpt_student_secret_serverbyte_2026_isolated_student_key!');
    const rStudent = await makeHttpsRequest('/artigo/como-transformar-habilidade-pessoal-em-fonte-de-renda', {
      headers: { 'Cookie': `vpt_auth_token=${studentToken}` }
    });
    assert(rStudent.statusCode === 404, 'Token de estudante não permite acesso ao preview e recebe 404', `HTTP ${rStudent.statusCode}`);

    // 6. Sitemap em Produção
    console.log('\n[6/8] Verificando Sitemap Oficial em Produção...');
    const rSitemap = await makeHttpsRequest('/sitemap.xml');
    assert(rSitemap.statusCode === 200, 'sitemap.xml responde HTTP 200', `HTTP ${rSitemap.statusCode}`);
    const sitemapUrls = rSitemap.body.match(/<loc>(.*?)<\/loc>/g) || [];
    const sitemapBlogs = sitemapUrls.filter(u => u.includes('/artigo/'));
    const sitemapStatics = sitemapUrls.filter(u => !u.includes('/artigo/'));
    assert(sitemapUrls.length === 49, 'sitemap.xml contém exatamente 49 URLs', `Obteve ${sitemapUrls.length}`);
    assert(sitemapStatics.length === 21, 'sitemap.xml contém exatamente 21 páginas estáticas', `Obteve ${sitemapStatics.length}`);
    assert(sitemapBlogs.length === 28, 'sitemap.xml contém exatamente 28 artigos publicados', `Obteve ${sitemapBlogs.length}`);
    assert(!rSitemap.body.includes('como-transformar-habilidade-pessoal-em-fonte-de-renda'), 'sitemap.xml NÃO contém o artigo agendado futuro');

    // 7. Feed RSS em Produção
    console.log('\n[7/8] Verificando Feed RSS Oficial em Produção...');
    const rRss = await makeHttpsRequest('/rss.xml');
    assert(rRss.statusCode === 200, 'rss.xml responde HTTP 200', `HTTP ${rRss.statusCode}`);
    const rssItems = rRss.body.match(/<item>/g) || [];
    assert(rssItems.length === 28, 'rss.xml contém exatamente 28 itens publicados', `Obteve ${rssItems.length}`);
    assert(!rRss.body.includes('como-transformar-habilidade-pessoal-em-fonte-de-renda'), 'rss.xml NÃO contém artigos futuros');

    // 8. Amostragem de Artigos Agendados em Produção
    console.log('\n[8/8] Testando Amostragem de Artigos Agendados em Produção (Todos devem retornar 404)...');
    const sampleScheduledSlugs = [
      'programacao-para-iniciantes-como-comecar-sem-saber-codigo', // ID 22 (Amanhã 15/11)
      'microsoft-learn-aprenda-tecnologia-e-nuvem-com-a-microsoft', // ID 23
      'o-que-os-recrutadores-realmente-procuram-em-um-candidato-2026', // ID 24
      'hackers-do-bem-como-comecar-carreira-ciberseguranca', // ID 29
      'como-fazer-transicao-de-carreira-para-inteligencia-artificial', // ID 50
      'erros-mais-comuns-de-quem-comeca-a-empreender-como-evitar' // ID 137 (Março 2027)
    ];

    let schedLeaks = 0;
    for (const slug of sampleScheduledSlugs) {
      const res = await makeHttpsRequest(`/artigo/${slug}`);
      if (res.statusCode !== 404) {
        schedLeaks++;
        console.log(`  ❌ VAZAMENTO EM PRODUÇÃO: /artigo/${slug} retornou HTTP ${res.statusCode}`);
      }
    }
    assert(schedLeaks === 0, 'Todos os artigos agendados testados na amostragem retornaram HTTP 404 real em produção');

  } catch (err) {
    console.error('Erro na auditoria de produção:', err);
  }

  console.log(`\n========================================================================`);
  console.log(`RESULTADO DA AUDITORIA DE PRODUÇÃO: ${passes} de ${total} verificações APROVADAS!`);
  if (passes === total) {
    console.log('🎉 SUCESSO TOTAL! A PRODUÇÃO ESTÁ 100% PROTEGIDA E OPERACIONAL!');
  } else {
    console.log('⚠️ ATENÇÃO: Houve falhas na validação de produção.');
  }
  console.log(`========================================================================\n`);
}

runProductionAudit();
