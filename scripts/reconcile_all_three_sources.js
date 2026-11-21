const fs = require('fs');

const cache = JSON.parse(fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/api/cache_blog.json', 'utf8'));
const seed = JSON.parse(fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/api/seed_blog.json', 'utf8'));
const txtContent = fs.readFileSync('C:/Users/usuario/Downloads/vocepodetudo_artigos_blog_controle_interno_2026-11-14.txt', 'utf8');

console.log('Comparing 144 items between cache, seed and txt export...');

let diffCount = 0;
const report = [];

for (let id = 1; id <= 144; id++) {
  const c = cache.find(x => x.id === id);
  const s = seed.find(x => x.id === id);
  
  if (!c || !s) {
    console.log(`ERROR: Missing ID ${id} in cache or seed!`);
    diffCount++;
    continue;
  }

  // Check differences between cache and seed
  const titleDiff = c.title !== s.title;
  const slugDiff = c.slug !== s.slug;
  const catDiff = c.category !== s.category;
  const dateDiff = c.created_at !== s.created_at;

  // Check in txt
  const marker = '• ID do Sistema: ' + id + '\r\n';
  const markerAlt = '• ID do Sistema: ' + id + '\n';
  let inTxt = txtContent.includes(marker) || txtContent.includes(markerAlt);

  report.push({
    id,
    title: c.title,
    slug: c.slug,
    category: c.category,
    created_at: c.created_at,
    inSeed: !!s,
    inTxt: inTxt,
    seedMatch: !titleDiff && !slugDiff && !catDiff && !dateDiff
  });

  if (titleDiff || slugDiff || catDiff || dateDiff || !inTxt) {
    console.log(`DIFF at ID ${id}: titleDiff=${titleDiff}, slugDiff=${slugDiff}, catDiff=${catDiff}, dateDiff=${dateDiff}, inTxt=${inTxt}`);
    diffCount++;
  }
}

console.log(`Total items checked: 144. Discrepancies between cache, seed and txt: ${diffCount}`);
fs.writeFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/scripts/reconciliation_true_check.json', JSON.stringify(report, null, 2), 'utf8');
