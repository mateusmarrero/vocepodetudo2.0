const fs = require('fs');
const path = require('path');

const baseDir = path.resolve(__dirname, '..');

// 1. Atualizar cursos-gratis-administracao.html e cursos-gratis-ingles.html
const targetLinks = `      <div class="flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
        <a href="index.html" class="hover:text-emerald-400 transition-colors">Início</a>
        <span>•</span>
        <a href="curriculo.html" class="hover:text-emerald-400 transition-colors">Criador de Currículo</a>
        <span>•</span>
        <a href="simulador-entrevista.html" class="hover:text-emerald-400 transition-colors">Simulador</a>
        <span>•</span>
        <a href="teste-vocacional.html" class="hover:text-emerald-400 transition-colors">Teste Vocacional</a>
        <span>•</span>
        <a href="politica-privacidade.html" class="hover:text-emerald-400 transition-colors font-medium text-slate-300">Política de Privacidade</a>
        <span>•</span>
        <a href="termos-de-uso.html" class="hover:text-emerald-400 transition-colors font-medium text-slate-300">Termos de Uso</a>
      </div>
      <div class="pt-3 text-slate-500 text-[10px]">`;

['cursos-gratis-administracao.html', 'cursos-gratis-ingles.html'].forEach(filename => {
  const filePath = path.join(baseDir, filename);
  let html = fs.readFileSync(filePath, 'utf-8');
  if (!html.includes('politica-privacidade.html')) {
    html = html.replace('<div class="pt-3 text-slate-500 text-[10px]">', targetLinks);
    fs.writeFileSync(filePath, html, 'utf-8');
    console.log(`[OK] Adicionados links no rodapé de ${filename}`);
  } else {
    console.log(`[INFO] ${filename} já possui links de privacidade/termos.`);
  }
});

// 2. Atualizar sitemap.xml
const sitemapPath = path.join(baseDir, 'sitemap.xml');
let sitemap = fs.readFileSync(sitemapPath, 'utf-8');

const sitemapEntries = `  <url>
    <loc>https://www.vocepodetudo.com/politica-privacidade.html</loc>
    <lastmod>2026-11-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://www.vocepodetudo.com/termos-de-uso.html</loc>
    <lastmod>2026-11-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;

if (!sitemap.includes('politica-privacidade.html')) {
  sitemap = sitemap.replace('</urlset>', sitemapEntries);
  fs.writeFileSync(sitemapPath, sitemap, 'utf-8');
  console.log('[OK] sitemap.xml atualizado com política e termos.');
} else {
  console.log('[INFO] sitemap.xml já continha política e termos.');
}

// 3. Atualizar sw.js
const swPath = path.join(baseDir, 'sw.js');
let sw = fs.readFileSync(swPath, 'utf-8');

// Atualizar versão do cache
sw = sw.replace(/vocepodetudo-pwa-v\d+\.\d+\.\d+/g, 'vocepodetudo-pwa-v4.42.0');

// Inserir politica-privacidade.html e termos-de-uso.html no PRECACHE_ASSETS se não estiver
if (!sw.includes("'/politica-privacidade.html'")) {
  sw = sw.replace(
    "'/materiais-gratuitos.html',",
    "'/materiais-gratuitos.html',\n  '/politica-privacidade.html',\n  '/termos-de-uso.html',"
  );
  fs.writeFileSync(swPath, sw, 'utf-8');
  console.log('[OK] sw.js atualizado para v4.42.0 com novas páginas no precache.');
} else {
  fs.writeFileSync(swPath, sw, 'utf-8');
  console.log('[OK] sw.js versão atualizada para v4.42.0.');
}

// 4. Atualizar scripts/deploy_ftp.js
const deployScriptPath = path.join(baseDir, 'scripts', 'deploy_ftp.js');
let deployScript = fs.readFileSync(deployScriptPath, 'utf-8');

if (!deployScript.includes("'politica-privacidade.html'")) {
  const insertIndex = deployScript.indexOf("{ local: 'ads.txt', remote: 'ads.txt' },");
  if (insertIndex !== -1) {
    deployScript = deployScript.replace(
      "{ local: 'ads.txt', remote: 'ads.txt' },",
      `{ local: 'ads.txt', remote: 'ads.txt' },
  { local: 'politica-privacidade.html', remote: 'politica-privacidade.html' },
  { local: 'termos-de-uso.html', remote: 'termos-de-uso.html' },`
    );
    fs.writeFileSync(deployScriptPath, deployScript, 'utf-8');
    console.log('[OK] scripts/deploy_ftp.js atualizado para enviar politica-privacidade e termos-de-uso.');
  }
} else {
  console.log('[INFO] scripts/deploy_ftp.js já continha novos arquivos.');
}
