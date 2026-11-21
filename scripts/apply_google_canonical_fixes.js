const fs = require('fs');
const path = require('path');

const projectDir = 'C:\\Users\\usuario\\Downloads\\VCPDTD ANTIGRAVITY';

console.log('=== ETAPA 1: ATUALIZAR SITEMAP.XML ===');
let sitemap = fs.readFileSync(path.join(projectDir, 'sitemap.xml'), 'utf8');

// Substituir todas as ocorrências de www.vocepodetudo.com por vocepodetudo.com
const initialWwwCount = (sitemap.match(/www\.vocepodetudo\.com/g) || []).length;
sitemap = sitemap.replace(/https:\/\/www\.vocepodetudo\.com/g, 'https://vocepodetudo.com');

// Remover a entrada duplicada de criar-curriculo (já que a canônica e arquivo é curriculo.html)
const criarCurriculoBlockRegex = /\s*<url>\s*<loc>https:\/\/vocepodetudo\.com\/criar-curriculo<\/loc>[\s\S]*?<\/url>/g;
sitemap = sitemap.replace(criarCurriculoBlockRegex, '');

fs.writeFileSync(path.join(projectDir, 'sitemap.xml'), sitemap, 'utf8');
console.log(`✅ sitemap.xml atualizado! Removidas ${initialWwwCount} ocorrências de www e removida URL duplicada /criar-curriculo.`);

console.log('\n=== ETAPA 2: ATUALIZAR RSS.XML E SCRIPT GERADOR ===');
let rss = fs.readFileSync(path.join(projectDir, 'rss.xml'), 'utf8');
const initialRssWwwCount = (rss.match(/www\.vocepodetudo\.com/g) || []).length;
rss = rss.replace(/https:\/\/www\.vocepodetudo\.com/g, 'https://vocepodetudo.com');
fs.writeFileSync(path.join(projectDir, 'rss.xml'), rss, 'utf8');
console.log(`✅ rss.xml atualizado! Removidas ${initialRssWwwCount} ocorrências de www.`);

// Atualizar script scripts/generate_sitemap_rss.js
let genScript = fs.readFileSync(path.join(projectDir, 'scripts', 'generate_sitemap_rss.js'), 'utf8');
genScript = genScript.replace(/https:\/\/www\.vocepodetudo\.com/g, 'https://vocepodetudo.com');
fs.writeFileSync(path.join(projectDir, 'scripts', 'generate_sitemap_rss.js'), genScript, 'utf8');
console.log('✅ scripts/generate_sitemap_rss.js atualizado.');

console.log('\n=== ETAPA 3: ATUALIZAR CURRICULO.HTML PARA CANÔNICA CONSISTENTE ===');
let curriculoHtml = fs.readFileSync(path.join(projectDir, 'curriculo.html'), 'utf8');
curriculoHtml = curriculoHtml.replace(
  '<link rel="canonical" href="https://vocepodetudo.com/criar-curriculo">',
  '<link rel="canonical" href="https://vocepodetudo.com/curriculo.html">'
);
curriculoHtml = curriculoHtml.replace(
  '<meta property="og:url" content="https://vocepodetudo.com/criar-curriculo">',
  '<meta property="og:url" content="https://vocepodetudo.com/curriculo.html">'
);
fs.writeFileSync(path.join(projectDir, 'curriculo.html'), curriculoHtml, 'utf8');
console.log('✅ curriculo.html atualizado com canônica unificada em /curriculo.html.');

console.log('\n=== ETAPA 4: ATUALIZAR INDEX.HTML (OG, TWITTER, SCHEMA E WWW) ===');
let indexHtml = fs.readFileSync(path.join(projectDir, 'index.html'), 'utf8');
indexHtml = indexHtml.replace(/https:\/\/www\.vocepodetudo\.com/g, 'https://vocepodetudo.com');
indexHtml = indexHtml.replace('www.vocepodetudo.com • Dados Oficiais do Servidor', 'vocepodetudo.com • Dados Oficiais do Servidor');
fs.writeFileSync(path.join(projectDir, 'index.html'), indexHtml, 'utf8');
console.log('✅ index.html atualizado.');

console.log('\n=== ETAPA 5: ATUALIZAR TODOS OS ARQUIVOS HTML (LINKS INTERNOS INDEX.HTML -> / E IMAGENS COM WWW) ===');
const htmlFiles = fs.readdirSync(projectDir).filter(f => f.endsWith('.html'));
htmlFiles.forEach(f => {
  let content = fs.readFileSync(path.join(projectDir, f), 'utf8');
  let changed = false;

  // Substituir www.vocepodetudo.com por vocepodetudo.com
  if (content.includes('www.vocepodetudo.com')) {
    content = content.replace(/https:\/\/www\.vocepodetudo\.com/g, 'https://vocepodetudo.com');
    content = content.replace(/www\.vocepodetudo\.com/g, 'vocepodetudo.com');
    changed = true;
  }

  // Substituir href="index.html" por href="/" para manter links canônicos perfeitos
  if (content.includes('href="index.html"')) {
    content = content.replace(/href="index\.html"/g, 'href="/"');
    changed = true;
  }
  if (content.includes("href='index.html'")) {
    content = content.replace(/href='index\.html'/g, "href='/'");
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(path.join(projectDir, f), content, 'utf8');
    console.log(`✅ [${f}] atualizado.`);
  }
});

console.log('\n=== ETAPA 6: ATUALIZAR SRC JS (APP.JS, BLOG.JS, VAGAS.JS) ===');
['app.js', 'blog.js', 'vagas.js'].forEach(f => {
  const filePath = path.join(projectDir, 'src', f);
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('www.vocepodetudo.com')) {
    content = content.replace(/https:\/\/www\.vocepodetudo\.com/g, 'https://vocepodetudo.com');
    content = content.replace(/www\.vocepodetudo\.com/g, 'vocepodetudo.com');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ src/${f} atualizado.`);
  }
});

console.log('\n=== ETAPA 7: ATUALIZAR ARTIGO.PHP, MANIFEST.JSON, ROBOTS.TXT ===');
// artigo.php
let artigo = fs.readFileSync(path.join(projectDir, 'artigo.php'), 'utf8');
artigo = artigo.replace(/https:\/\/www\.vocepodetudo\.com/g, 'https://vocepodetudo.com');
fs.writeFileSync(path.join(projectDir, 'artigo.php'), artigo, 'utf8');
console.log('✅ artigo.php atualizado.');

// manifest.json
let manifest = fs.readFileSync(path.join(projectDir, 'manifest.json'), 'utf8');
manifest = manifest.replace(/https:\/\/www\.vocepodetudo\.com/g, 'https://vocepodetudo.com');
fs.writeFileSync(path.join(projectDir, 'manifest.json'), manifest, 'utf8');
console.log('✅ manifest.json atualizado.');

// robots.txt
let robots = fs.readFileSync(path.join(projectDir, 'robots.txt'), 'utf8');
robots = robots.replace(/www\.vocepodetudo\.com/g, 'vocepodetudo.com');
fs.writeFileSync(path.join(projectDir, 'robots.txt'), robots, 'utf8');
console.log('✅ robots.txt atualizado.');

console.log('\n=== ETAPA 8: ATUALIZAR .HTACCESS COM DIRETRIZES DO GOOGLE ===');
let htaccess = fs.readFileSync(path.join(projectDir, '.htaccess'), 'utf8');

// 1. Garantir redirecionamento de index.html para /
if (!htaccess.includes('RewriteRule ^index\\.html$')) {
  const indexRedirect = `  # Redirecionar /index.html para a raiz / (Solução do Google para evitar conteúdo duplicado)\n  RewriteCond %{THE_REQUEST} ^[A-Z]{3,9}\\ /index\\.html\\ HTTP/\n  RewriteRule ^index\\.html$ https://vocepodetudo.com/ [R=301,L]\n\n`;
  htaccess = htaccess.replace('RewriteEngine On\n', 'RewriteEngine On\n' + indexRedirect);
}

// 2. Garantir que /criar-curriculo redirecione 301 para /curriculo.html (em vez de rewrite interno silencioso)
htaccess = htaccess.replace('RewriteRule ^criar-curriculo/?$ curriculo.html [L]', 'RewriteRule ^criar-curriculo/?$ /curriculo.html [R=301,L]');

fs.writeFileSync(path.join(projectDir, '.htaccess'), htaccess, 'utf8');
console.log('✅ .htaccess atualizado com redirecionamento 301 de index.html e criar-curriculo.');
