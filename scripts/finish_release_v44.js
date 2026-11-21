const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

// 1. Atualizar sitemap.xml
const sitemapPath = path.join(baseDir, 'sitemap.xml');
let sitemap = fs.readFileSync(sitemapPath, 'utf-8');

const newSitemapEntries = `  <url>
    <loc>https://www.vocepodetudo.com/sobre.html</loc>
    <lastmod>2026-11-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.vocepodetudo.com/contato.html</loc>
    <lastmod>2026-11-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;

if (!sitemap.includes('sobre.html')) {
  sitemap = sitemap.replace('</urlset>', newSitemapEntries);
  fs.writeFileSync(sitemapPath, sitemap, 'utf-8');
  console.log('[OK] sitemap.xml atualizado com sobre.html e contato.html!');
}

// 2. Atualizar sw.js
const swPath = path.join(baseDir, 'sw.js');
let sw = fs.readFileSync(swPath, 'utf-8');
sw = sw.replace(/vocepodetudo-pwa-v\d+\.\d+\.\d+/g, 'vocepodetudo-pwa-v4.44.0');

if (!sw.includes("'/sobre.html'")) {
  sw = sw.replace(
    "'/downloads.html',",
    "'/downloads.html',\n  '/sobre.html',\n  '/contato.html',\n  '/src/cookie-banner.js',"
  );
  fs.writeFileSync(swPath, sw, 'utf-8');
  console.log('[OK] sw.js atualizado com novas páginas e cookie-banner no precache (v4.44.0)!');
} else {
  fs.writeFileSync(swPath, sw, 'utf-8');
}

// 3. Atualizar scripts/deploy_ftp.js
const deployPath = path.join(baseDir, 'scripts', 'deploy_ftp.js');
let deploy = fs.readFileSync(deployPath, 'utf-8');

if (!deploy.includes("'sobre.html'")) {
  deploy = deploy.replace(
    "{ local: 'downloads.html', remote: 'downloads.html' },",
    `{ local: 'downloads.html', remote: 'downloads.html' },
      { local: 'sobre.html', remote: 'sobre.html' },
      { local: 'contato.html', remote: 'contato.html' },
      { local: 'src/cookie-banner.js', remote: 'src/cookie-banner.js' },
      { local: 'api/contact.php', remote: 'api/contact.php' },`
  );
  fs.writeFileSync(deployPath, deploy, 'utf-8');
  console.log('[OK] scripts/deploy_ftp.js atualizado com sobre, contato, cookie-banner e api/contact.php!');
}
