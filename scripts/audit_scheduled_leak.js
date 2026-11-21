const fs = require('fs');

const cache = JSON.parse(fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/api/cache_blog.json', 'utf8'));
const now = new Date('2026-11-14T21:43:00-03:00');

const scheduled = cache.filter(p => {
  const dt = new Date(p.created_at.replace(' ', 'T') + '-03:00');
  return dt > now;
}).sort((a,b) => a.id - b.id);

console.log('Total scheduled articles identified:', scheduled.length);

const sitemap = fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/sitemap.xml', 'utf8');

const auditScheduled = scheduled.map(p => {
  const inSitemap = sitemap.includes(`/artigo/${p.slug}`);
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    scheduled_for: p.created_at,
    inSitemap: inSitemap,
    category: p.category
  };
});

const notInSitemap = auditScheduled.filter(x => !x.inSitemap);
console.log('Scheduled articles present in sitemap.xml:', auditScheduled.filter(x => x.inSitemap).length);
console.log('Scheduled articles NOT in sitemap.xml:', notInSitemap.length);

fs.writeFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/scripts/scheduled_audit_full.json', JSON.stringify(auditScheduled, null, 2), 'utf8');
