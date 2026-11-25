const fs = require('fs');
const path = require('path');

// 1. Atualizar index.html
const indexPath = path.resolve(__dirname, '../index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf8');

// Adicionar preconnect para images.unsplash.com se não existir
if (!indexHtml.includes('https://images.unsplash.com')) {
  indexHtml = indexHtml.replace(
    '<!-- Resource Hints para Performance Extrema (FCP / LCP) -->',
    '<!-- Resource Hints para Performance Extrema (FCP / LCP) -->\n  <link rel="preconnect" href="https://images.unsplash.com" crossorigin>\n  <link rel="dns-prefetch" href="https://images.unsplash.com">'
  );
  console.log('✅ Preconnect do Unsplash adicionado ao index.html.');
}

// Atualizar meta description para refletir mais de 200 cursos
indexHtml = indexHtml.replace(/Mais de 155 cursos/g, 'Mais de 200 cursos');
fs.writeFileSync(indexPath, indexHtml, 'utf8');
console.log('✅ index.html atualizado.');

// 2. Atualizar sw.js
const swPath = path.resolve(__dirname, '../sw.js');
let swJs = fs.readFileSync(swPath, 'utf8');
swJs = swJs.replace(/vocepodetudo-pwa-v4\.89\.0/g, 'vocepodetudo-pwa-v4.90.0');
swJs = swJs.replace(/v4\.89\.0/g, 'v4.90.0');

if (!swJs.includes("'/curso.php'")) {
  swJs = swJs.replace(
    "  '/artigo.php',",
    "  '/artigo.php',\n  '/curso.php',"
  );
  if (!swJs.includes("'/curso.php'")) {
    swJs = swJs.replace(
      "  '/',",
      "  '/',\n  '/curso.php',"
    );
  }
  console.log('✅ curso.php adicionado ao sw.js.');
}
fs.writeFileSync(swPath, swJs, 'utf8');
console.log('✅ sw.js atualizado para v4.90.0.');

// 3. Atualizar deploy_ftp.js
const deployPath = path.resolve(__dirname, './deploy_ftp.js');
let deployJs = fs.readFileSync(deployPath, 'utf8');

if (!deployJs.includes("'curso.php'")) {
  deployJs = deployJs.replace(
    "{ local: 'artigo.php', remote: 'artigo.php' },",
    "{ local: 'artigo.php', remote: 'artigo.php' },\n      { local: 'curso.php', remote: 'curso.php' },"
  );
  console.log('✅ curso.php adicionado ao deploy_ftp.js.');
}

if (!deployJs.includes("'sitemap.php'")) {
  deployJs = deployJs.replace(
    "{ local: 'sitemap.xml', remote: 'sitemap.xml' },",
    "{ local: 'sitemap.xml', remote: 'sitemap.xml' },\n      { local: 'sitemap.php', remote: 'sitemap.php' },"
  );
  console.log('✅ sitemap.php adicionado ao deploy_ftp.js.');
}
fs.writeFileSync(deployPath, deployJs, 'utf8');
console.log('✅ deploy_ftp.js atualizado.');

// 4. Atualizar CHANGELOG.md
const changelogPath = path.resolve(__dirname, '../CHANGELOG.md');
let changelog = fs.readFileSync(changelogPath, 'utf8');

const newEntry = `## [4.90.0] - 2026-11-25

### Adicionado
- **Páginas Individuais Oficiais de Cursos (\`curso.php\`)**: Criação da infraestrutura completa Server-Side Rendered (SSR) com rotas amigáveis (\`/curso/<id>\`) no Apache/StackCP para todos os 200 cursos catalogados.
- **Dados Estruturados Schema.org (\`Course\` & \`BreadcrumbList\`)**: Marcação JSON-LD completa e padronizada para indexação avançada no Googlebot com Rich Snippets (avaliação, carga horária, modalidade online, certificação e gratuidade).
- **Imagens de Capa nos Cards do Catálogo**: Exibição de thumbnails fotográficos em alta resolução com lazy-loading (\`loading="lazy"\`, \`decoding="async"\`, proporção 16:9 anti-CLS) e links diretos para cada curso.
- **Auditoria de Imagens e Diversificação**: Substituição da imagem quebrada 404 em 24 cursos e diversificação temática por área de conhecimento (Marketing, Negócios, Vendas, MEI, Finanças, Saúde e Tecnologia), com 100% das URLs validadas com HTTP 200 OK.
- **Expansão do Sitemap XML Oficial**: Inclusão dinâmica e estática de todos os 200 cursos em \`sitemap.php\` e \`sitemap.xml\` (total de 280 URLs indexáveis com prioridade 0.85).
- **Otimizações Mobile & Core Web Vitals**: Inclusão de \`preconnect\` para \`images.unsplash.com\`, barra inferior flutuante de conversão em telas mobile (\`sticky bottom bar\`), dicas práticas ATS para currículo e Service Worker atualizado para cache PWA offline.

---

`;

if (!changelog.includes('[4.90.0]')) {
  changelog = changelog.replace('# Histórico de Alterações (Changelog)\n\n', '# Histórico de Alterações (Changelog)\n\n' + newEntry);
  fs.writeFileSync(changelogPath, changelog, 'utf8');
  console.log('✅ CHANGELOG.md atualizado.');
}
