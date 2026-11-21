const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

// 1. Ler materiais-gratuitos.html
const matHtml = fs.readFileSync(path.join(baseDir, 'materiais-gratuitos.html'), 'utf-8');

// 2. Criar downloads.html adaptado
let downHtml = matHtml
  .replace(
    '<title>Central de Materiais Gratuitos: Modelos de Currículo, Planilhas e Checklists — Você Pode Tudo</title>',
    '<title>Central de Downloads Gratuitos: Modelos de Currículo, Planilhas e Checklists — Você Pode Tudo</title>'
  )
  .replace(
    '<link rel="canonical" href="https://vocepodetudo.com/materiais-gratuitos.html">',
    '<link rel="canonical" href="https://vocepodetudo.com/downloads.html">'
  )
  .replace(
    '<meta property="og:url" content="https://vocepodetudo.com/materiais-gratuitos.html">',
    '<meta property="og:url" content="https://vocepodetudo.com/downloads.html">'
  );

fs.writeFileSync(path.join(baseDir, 'downloads.html'), downHtml, 'utf-8');
console.log('[OK] downloads.html criado com sucesso!');

// 3. Atualizar .htaccess
const htaccessPath = path.join(baseDir, '.htaccess');
let htaccess = fs.readFileSync(htaccessPath, 'utf-8');
if (!htaccess.includes('RewriteRule ^downloads')) {
  const rewriteRule = `\n# Redirecionamento amigavel para a pagina de downloads\nRewriteRule ^downloads/?$ downloads.html [L,QSA]\nRewriteRule ^download/?$ downloads.html [L,QSA]\n`;
  htaccess = htaccess.replace('RewriteEngine On', 'RewriteEngine On' + rewriteRule);
  fs.writeFileSync(htaccessPath, htaccess, 'utf-8');
  console.log('[OK] .htaccess atualizado com redirecionamento amigável para /downloads!');
} else {
  console.log('[INFO] .htaccess já possui regra de downloads.');
}

// 4. Atualizar sitemap.xml
const sitemapPath = path.join(baseDir, 'sitemap.xml');
let sitemap = fs.readFileSync(sitemapPath, 'utf-8');
if (!sitemap.includes('downloads.html')) {
  const sitemapEntry = `  <url>
    <loc>https://www.vocepodetudo.com/downloads.html</loc>
    <lastmod>2026-11-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>\n</urlset>`;
  sitemap = sitemap.replace('</urlset>', sitemapEntry);
  fs.writeFileSync(sitemapPath, sitemap, 'utf-8');
  console.log('[OK] sitemap.xml atualizado com downloads.html!');
} else {
  console.log('[INFO] sitemap.xml já continha downloads.html.');
}

// 5. Atualizar sw.js
const swPath = path.join(baseDir, 'sw.js');
let sw = fs.readFileSync(swPath, 'utf-8');
if (!sw.includes("'/downloads.html'")) {
  sw = sw.replace("'/materiais-gratuitos.html',", "'/materiais-gratuitos.html',\n  '/downloads.html',");
  fs.writeFileSync(swPath, sw, 'utf-8');
  console.log('[OK] sw.js atualizado com downloads.html no precache!');
}

// 6. Atualizar scripts/deploy_ftp.js
const deployScriptPath = path.join(baseDir, 'scripts', 'deploy_ftp.js');
let deploy = fs.readFileSync(deployScriptPath, 'utf-8');
if (!deploy.includes("'downloads.html'")) {
  deploy = deploy.replace(
    "{ local: 'materiais-gratuitos.html', remote: 'materiais-gratuitos.html' },",
    "{ local: 'materiais-gratuitos.html', remote: 'materiais-gratuitos.html' },\n      { local: 'downloads.html', remote: 'downloads.html' },"
  );
  fs.writeFileSync(deployScriptPath, deploy, 'utf-8');
  console.log('[OK] scripts/deploy_ftp.js atualizado para enviar downloads.html!');
}
