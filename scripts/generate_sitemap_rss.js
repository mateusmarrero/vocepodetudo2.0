const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const seedPath = path.join(projectRoot, 'api', 'seed_blog.json');
const sitemapPath = path.join(projectRoot, 'sitemap.xml');
const rssPath = path.join(projectRoot, 'rss.xml');

const posts = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
console.log(`Encontrados ${posts.length} artigos para SEO e RSS.`);

// Páginas Fixas Oficiais com URLs Amigáveis
const staticPages = [
  { url: 'https://vocepodetudo.com/', priority: '1.0', changefreq: 'daily', lastmod: '2026-11-13' },
  { url: 'https://vocepodetudo.com/vagas', priority: '0.95', changefreq: 'daily', lastmod: '2026-11-13' },
  { url: 'https://vocepodetudo.com/blog', priority: '0.9', changefreq: 'weekly', lastmod: '2026-11-13' },
  { url: 'https://vocepodetudo.com/curriculo', priority: '0.95', changefreq: 'weekly', lastmod: '2026-11-13' },
  { url: 'https://vocepodetudo.com/simulador-entrevista', priority: '0.95', changefreq: 'weekly', lastmod: '2026-11-13' },
  { url: 'https://vocepodetudo.com/calculadora-trabalhista', priority: '0.9', changefreq: 'monthly', lastmod: '2026-11-13' },
  { url: 'https://vocepodetudo.com/teste-vocacional', priority: '0.9', changefreq: 'monthly', lastmod: '2026-11-13' },
  { url: 'https://vocepodetudo.com/downloads', priority: '0.9', changefreq: 'weekly', lastmod: '2026-11-13' },
  { url: 'https://vocepodetudo.com/sobre', priority: '0.8', changefreq: 'monthly', lastmod: '2026-11-13' },
  { url: 'https://vocepodetudo.com/contato', priority: '0.8', changefreq: 'monthly', lastmod: '2026-11-13' },
  { url: 'https://vocepodetudo.com/politica-privacidade', priority: '0.5', changefreq: 'yearly', lastmod: '2026-11-13' },
  { url: 'https://vocepodetudo.com/termos-de-uso', priority: '0.5', changefreq: 'yearly', lastmod: '2026-11-13' },
  { url: 'https://vocepodetudo.com/cursos-gratis-informatica', priority: '0.85', changefreq: 'weekly', lastmod: '2026-11-13' },
  { url: 'https://vocepodetudo.com/cursos-gratis-excel', priority: '0.85', changefreq: 'weekly', lastmod: '2026-11-13' },
  { url: 'https://vocepodetudo.com/cursos-gratis-programacao', priority: '0.85', changefreq: 'weekly', lastmod: '2026-11-13' },
  { url: 'https://vocepodetudo.com/cursos-gratis-ia', priority: '0.85', changefreq: 'weekly', lastmod: '2026-11-13' },
  { url: 'https://vocepodetudo.com/cursos-gratis-administracao', priority: '0.85', changefreq: 'weekly', lastmod: '2026-11-13' },
  { url: 'https://vocepodetudo.com/cursos-gratis-ingles', priority: '0.85', changefreq: 'weekly', lastmod: '2026-11-13' },
  { url: 'https://vocepodetudo.com/vagas-jovem-aprendiz-2026', priority: '0.9', changefreq: 'weekly', lastmod: '2026-11-13' }
];

// 1. GERAR SITEMAP.XML LIMPO COM URLS AMIGÁVEIS
let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

  <!-- Páginas Estratégicas e Ferramentas (URLs Amigáveis Oficiais) -->
`;

staticPages.forEach(p => {
  sitemapContent += `  <url>
    <loc>${p.url}</loc>
    <lastmod>${p.lastmod}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>\n`;
});

sitemapContent += `\n  <!-- ========================================== -->
  <!-- Artigos Oficiais do Blog Você Pode Tudo    -->
  <!-- ========================================== -->\n`;

posts.forEach(p => {
  const slug = p.slug;
  const date = (p.created_at || '2026-11-01').slice(0, 10);
  sitemapContent += `  <url>
    <loc>https://vocepodetudo.com/artigo/${encodeURIComponent(slug)}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>\n`;
});

sitemapContent += '</urlset>\n';
fs.writeFileSync(sitemapPath, sitemapContent, 'utf8');
console.log(`✅ sitemap.xml regenerado com URLs amigáveis para ${staticPages.length} páginas e ${posts.length} artigos!`);

// 2. GERAR RSS.XML OFICIAL COM URLS AMIGÁVEIS
function escapeXml(unsafe) {
  return String(unsafe || '')
    .replace(/[<>&'"]/g, c => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
      }
    });
}

let rssContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
rssContent += '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n';
rssContent += '  <channel>\n';
rssContent += '    <title>Blog Você Pode Tudo — Empregabilidade e Carreira</title>\n';
rssContent += '    <link>https://vocepodetudo.com/blog</link>\n';
rssContent += '    <description>Dicas de currículo, entrevistas de emprego, mercado de trabalho e cursos gratuitos com certificado.</description>\n';
rssContent += '    <language>pt-BR</language>\n';
rssContent += `    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>\n`;
rssContent += '    <atom:link href="https://vocepodetudo.com/rss.xml" rel="self" type="application/rss+xml"/>\n';
rssContent += '    <image>\n';
rssContent += '      <url>https://vocepodetudo.com/assets/logo-icon.png</url>\n';
rssContent += '      <title>Você Pode Tudo</title>\n';
rssContent += '      <link>https://vocepodetudo.com/blog</link>\n';
rssContent += '    </image>\n';

posts.forEach(p => {
  const url = `https://vocepodetudo.com/artigo/${encodeURIComponent(p.slug)}`;
  const pubDate = new Date(p.created_at ? p.created_at.replace(/-/g, '/') : Date.now()).toUTCString();
  rssContent += '    <item>\n';
  rssContent += `      <title>${escapeXml(p.title)}</title>\n`;
  rssContent += `      <link>${url}</link>\n`;
  rssContent += `      <guid isPermaLink="true">${url}</guid>\n`;
  rssContent += `      <description>${escapeXml(p.excerpt || p.title)}</description>\n`;
  rssContent += `      <category>${escapeXml(p.category || 'Carreira')}</category>\n`;
  rssContent += `      <author>contato@vocepodetudo.com (${escapeXml(p.author || 'Equipe Você Pode Tudo')})</author>\n`;
  rssContent += `      <pubDate>${pubDate}</pubDate>\n`;
  rssContent += '    </item>\n';
});

rssContent += '  </channel>\n';
rssContent += '</rss>\n';

fs.writeFileSync(rssPath, rssContent, 'utf8');
console.log(`✅ rss.xml regenerado com URLs amigáveis e ${posts.length} artigos!`);
