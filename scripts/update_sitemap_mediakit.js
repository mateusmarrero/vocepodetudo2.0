const fs = require('fs');
let sitemap = fs.readFileSync('sitemap.xml', 'utf8');

const target = '<url>\n    <loc>https://vocepodetudo.com/sobre</loc>';
if (sitemap.includes(target) && !sitemap.includes('/midia-kit')) {
  const newEntry = `  <url>\n    <loc>https://vocepodetudo.com/midia-kit</loc>\n    <lastmod>2026-11-14</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.85</priority>\n  </url>\n` + target;
  sitemap = sitemap.replace(target, newEntry);
  fs.writeFileSync('sitemap.xml', sitemap, 'utf8');
  console.log('✅ sitemap.xml atualizado com /midia-kit!');
} else {
  console.log('sitemap já contém midia-kit ou target não bateu');
}
