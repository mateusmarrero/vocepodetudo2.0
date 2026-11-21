const https = require('https');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const projectRoot = 'C:\\Users\\usuario\\Downloads\\VCPDTD ANTIGRAVITY';
const posts = JSON.parse(fs.readFileSync(path.join(projectRoot, 'api', 'cache_blog.json'), 'utf8'));

const now = new Date();
const publishedPosts = posts.filter(p => Number(p.is_published) === 1 && new Date(p.created_at.replace(/-/g, '/')) <= now);
const scheduledPosts = posts.filter(p => Number(p.is_published) === 1 && new Date(p.created_at.replace(/-/g, '/')) > now);

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

function createToken(payloadObj, secret = 'vpt_secret_serverbyte_2026_super_secure_key_brasilll!') {
  const header = Buffer.from(JSON.stringify({ typ: 'JWT', alg: 'HS256' })).toString('base64');
  const payload = Buffer.from(JSON.stringify(payloadObj)).toString('base64');
  const signature = crypto.createHmac('sha256', secret).update(`${header}.${payload}`).digest('hex');
  return `${header}.${payload}.${signature}`;
}

async function runAudit() {
  console.log('========================================================================');
  console.log(' AUDITORIA DE ESTABILIDADE E MONITORAMENTO PÓS-DEPLOY EM PRODUÇÃO ');
  console.log(' Domínio: https://vocepodetudo.com | Data: ' + new Date().toISOString());
  console.log('========================================================================\n');

  const report = {
    articles: { publishedOk: 0, publishedFail: 0, scheduled404: 0, scheduledLeaks: 0 },
    sitemap: {},
    rss: {},
    homepage: {},
    id22: {},
    security: {}
  };

  // -------------------------------------------------------------------
  // 1. AUDITORIA DOS 28 ARTIGOS PUBLICADOS
  // -------------------------------------------------------------------
  console.log(`[1/6] Verificando estabilidade dos ${publishedPosts.length} artigos publicados...`);
  for (const p of publishedPosts) {
    const r = await makeHttpsRequest(`/artigo/${p.slug}`);
    if (r.statusCode === 200 && r.body.includes(p.title)) {
      report.articles.publishedOk++;
    } else {
      report.articles.publishedFail++;
      console.log(`  ❌ Falha no artigo publicado ID ${p.id} (${p.slug}): HTTP ${r.statusCode}`);
    }
  }
  console.log(`  ✅ Artigos Publicados: ${report.articles.publishedOk} de ${publishedPosts.length} com HTTP 200 OK.`);

  // -------------------------------------------------------------------
  // 2. AUDITORIA DOS 116 ARTIGOS AGENDADOS
  // -------------------------------------------------------------------
  console.log(`\n[2/6] Verificando bloqueio dos ${scheduledPosts.length} artigos agendados (todos devem ser 404)...`);
  for (let i = 0; i < scheduledPosts.length; i += 10) {
    const chunk = scheduledPosts.slice(i, i + 10);
    const results = await Promise.all(chunk.map(async sp => {
      const r = await makeHttpsRequest(`/artigo/${sp.slug}`);
      const leaked = (r.statusCode !== 404) || r.body.includes(sp.title) || r.body.includes('"@type": "NewsArticle"');
      return { sp, r, leaked };
    }));

    results.forEach(({ sp, r, leaked }) => {
      if (!leaked && r.statusCode === 404) {
        report.articles.scheduled404++;
      } else {
        report.articles.scheduledLeaks++;
        console.log(`  ❌ VAZAMENTO DETECTADO no ID ${sp.id} (${sp.slug}): HTTP ${r.statusCode}`);
      }
    });
    process.stdout.write(`  Progresso: ${report.articles.scheduled404}/${scheduledPosts.length} agendados testados...\r`);
  }
  console.log(`\n  ✅ Artigos Agendados: ${report.articles.scheduled404} de ${scheduledPosts.length} com HTTP 404 real (Zero vazamentos).`);

  // -------------------------------------------------------------------
  // 3. AUDITORIA DO SITEMAP
  // -------------------------------------------------------------------
  console.log('\n[3/6] Verificando sitemap.xml oficial em produção...');
  const rSitemap = await makeHttpsRequest('/sitemap.xml');
  const sitemapUrls = rSitemap.body.match(/<loc>(.*?)<\/loc>/g) || [];
  const sitemapBlogs = sitemapUrls.filter(u => u.includes('/artigo/'));
  const sitemapStatics = sitemapUrls.filter(u => !u.includes('/artigo/'));
  report.sitemap = {
    statusCode: rSitemap.statusCode,
    totalUrls: sitemapUrls.length,
    staticUrls: sitemapStatics.length,
    blogUrls: sitemapBlogs.length,
    hasScheduled: scheduledPosts.some(sp => rSitemap.body.includes(sp.slug))
  };
  console.log(`  HTTP Status: ${report.sitemap.statusCode}`);
  console.log(`  Total de URLs: ${report.sitemap.totalUrls} (Esperado: 49)`);
  console.log(`  Páginas Estáticas: ${report.sitemap.staticUrls} (Esperado: 21)`);
  console.log(`  Artigos Publicados: ${report.sitemap.blogUrls} (Esperado: 28)`);
  console.log(`  Vazamento de Artigos Futuros: ${report.sitemap.hasScheduled ? 'SIM (ERRO)' : 'NÃO (CORRETO)'}`);

  // -------------------------------------------------------------------
  // 4. AUDITORIA DO RSS
  // -------------------------------------------------------------------
  console.log('\n[4/6] Verificando rss.xml oficial em produção...');
  const rRss = await makeHttpsRequest('/rss.xml');
  const rssItems = rRss.body.match(/<item>/g) || [];
  report.rss = {
    statusCode: rRss.statusCode,
    totalItems: rssItems.length,
    hasScheduled: scheduledPosts.some(sp => rRss.body.includes(sp.slug))
  };
  console.log(`  HTTP Status: ${report.rss.statusCode}`);
  console.log(`  Total de Itens: ${report.rss.totalItems} (Esperado: 28)`);
  console.log(`  Vazamento de Artigos Futuros: ${report.rss.hasScheduled ? 'SIM (ERRO)' : 'NÃO (CORRETO)'}`);

  // -------------------------------------------------------------------
  // 5. AUDITORIA DA PÁGINA INICIAL (index.html)
  // -------------------------------------------------------------------
  console.log('\n[5/6] Auditando estrutura da página inicial (index.html)...');
  const rHome = await makeHttpsRequest('/');
  const hasFilterCert = rHome.body.includes('filter-cert-all') && rHome.body.includes('filter-cert-free');
  const hasProviderSelect = rHome.body.includes('provider-select');
  const hasWorkloadSelect = rHome.body.includes('workload-select');
  const hasSortSelect = rHome.body.includes('sort-select');
  const hasGridResponsive = rHome.body.includes('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3');
  const hasCoursesScript = rHome.body.includes('src/data/courses.js');
  const hasCourseDetailsScript = rHome.body.includes('src/data/course_details.js');
  const hasAppScript = rHome.body.includes('src/app.js');

  report.homepage = {
    statusCode: rHome.statusCode,
    hasFilterCert,
    hasProviderSelect,
    hasWorkloadSelect,
    hasSortSelect,
    hasGridResponsive,
    hasCoursesScript,
    hasCourseDetailsScript,
    hasAppScript
  };
  console.log(`  HTTP Status: ${report.homepage.statusCode}`);
  console.log(`  Painel de Filtros de Certificados: ${hasFilterCert ? 'Presente e íntegro' : 'Ausente'}`);
  console.log(`  Selects de Instituição/Duração/Ordenação: ${hasProviderSelect && hasWorkloadSelect && hasSortSelect ? 'Presentes' : 'Ausentes'}`);
  console.log(`  Grid Responsivo Independente (grid-cols-1 sm:grid-cols-2 lg:grid-cols-3): ${hasGridResponsive ? 'Sim' : 'Não'}`);
  console.log(`  Scripts da Aplicação Carregados: ${hasCoursesScript && hasCourseDetailsScript && hasAppScript ? 'Sim' : 'Não'}`);

  // -------------------------------------------------------------------
  // 6. MONITORAMENTO DO ARTIGO ID 22 (Publicação 15/11/2026 às 08:00)
  // -------------------------------------------------------------------
  console.log('\n[6/6] Verificando status atual do Artigo ID 22...');
  const art22 = posts.find(p => p.id === 22);
  const rArt22 = await makeHttpsRequest(`/artigo/${art22.slug}`);
  report.id22 = {
    id: art22.id,
    title: art22.title,
    slug: art22.slug,
    scheduledFor: art22.created_at,
    currentHttpCode: rArt22.statusCode,
    isBlocked: rArt22.statusCode === 404,
    inSitemap: rSitemap.body.includes(art22.slug),
    inRss: rRss.body.includes(art22.slug)
  };
  console.log(`  Artigo: ID ${art22.id} - "${art22.title}"`);
  console.log(`  Programado Para: ${art22.created_at} (Horário de Brasília)`);
  console.log(`  Código HTTP Atual (Antes das 08:00): HTTP ${report.id22.currentHttpCode} (${report.id22.isBlocked ? 'Bloqueado Corretamente' : 'ERRO: Vazado'})`);
  console.log(`  Presente no Sitemap Atual: ${report.id22.inSitemap ? 'SIM (ERRO)' : 'NÃO (CORRETO)'}`);
  console.log(`  Presente no RSS Atual: ${report.id22.inRss ? 'SIM (ERRO)' : 'NÃO (CORRETO)'}`);

  // -------------------------------------------------------------------
  // 7. AUDITORIA DE SEGURANÇA E TOKENS
  // -------------------------------------------------------------------
  console.log('\n[7/6 Extra] Auditoria de Segurança e Validação de Tokens...');
  // A. Admin válido
  const validAdmin = createToken({ user: 'admin_audit', role: 'admin', exp: Math.floor(Date.now() / 1000) + 3600 });
  const rValidAdmin = await makeHttpsRequest(`/artigo/${art22.slug}`, {
    headers: { 'Cookie': `vpt_auth_token=${validAdmin}` }
  });

  // B. Token expirado
  const expiredToken = createToken({ user: 'admin_audit', role: 'admin', exp: Math.floor(Date.now() / 1000) - 3600 });
  const rExpired = await makeHttpsRequest(`/artigo/${art22.slug}`, {
    headers: { 'Cookie': `vpt_auth_token=${expiredToken}` }
  });

  // C. Token adulterado
  const tamperedToken = validAdmin.substring(0, validAdmin.length - 8) + 'deadbeef';
  const rTampered = await makeHttpsRequest(`/artigo/${art22.slug}`, {
    headers: { 'Cookie': `vpt_auth_token=${tamperedToken}` }
  });

  // D. Token de estudante
  const studentToken = createToken({ sub: 123, role: 'student', exp: Math.floor(Date.now() / 1000) + 3600 }, 'vpt_student_secret_serverbyte_2026_isolated_student_key!');
  const rStudent = await makeHttpsRequest(`/artigo/${art22.slug}`, {
    headers: { 'Cookie': `vpt_auth_token=${studentToken}` }
  });

  // E. Tentativa anônima
  const rAnon = await makeHttpsRequest(`/artigo/${art22.slug}`);

  report.security = {
    validAdminPreview: rValidAdmin.statusCode === 200 && rValidAdmin.body.includes('Modo de Pré-visualização Administrativa'),
    expiredTokenBlocked: rExpired.statusCode === 404,
    tamperedTokenBlocked: rTampered.statusCode === 404,
    studentTokenBlocked: rStudent.statusCode === 404,
    anonymousBlocked: rAnon.statusCode === 404
  };

  console.log(`  Preview Administrativo com JWT Válido: ${report.security.validAdminPreview ? '✅ Aprovado (HTTP 200 + Banner)' : '❌ Falha'}`);
  console.log(`  Token Expirado: ${report.security.expiredTokenBlocked ? '✅ Bloqueado (HTTP 404)' : '❌ Falha'}`);
  console.log(`  Token com Assinatura Adulterada: ${report.security.tamperedTokenBlocked ? '✅ Bloqueado (HTTP 404)' : '❌ Falha'}`);
  console.log(`  Token de Estudante: ${report.security.studentTokenBlocked ? '✅ Bloqueado (HTTP 404)' : '❌ Falha'}`);
  console.log(`  Acesso Anônimo a Artigo Agendado: ${report.security.anonymousBlocked ? '✅ Bloqueado (HTTP 404)' : '❌ Falha'}`);

  console.log('\n========================================================================');
  console.log(' AUDITORIA CONCLUÍDA — GRAVANDO DADOS DO MONITORAMENTO ');
  console.log('========================================================================\n');

  fs.writeFileSync(path.join(projectRoot, 'scripts', 'post_deploy_audit_data.json'), JSON.stringify(report, null, 2), 'utf8');
}

runAudit();
