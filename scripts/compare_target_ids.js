const fs = require('fs');

const cache = JSON.parse(fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/api/cache_blog.json', 'utf8'));
const seed = JSON.parse(fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/api/seed_blog.json', 'utf8'));
const txt = fs.readFileSync('C:/Users/usuario/Downloads/vocepodetudo_artigos_blog_controle_interno_2026-11-14.txt', 'utf8');

const targetIds = [21, 105, 106, 107, 133, 134, 135, 136];

const results = targetIds.map(id => {
  const c = cache.find(x => x.id === id);
  const s = seed.find(x => x.id === id);

  // Extract from TXT
  const marker = '• ID do Sistema: ' + id;
  const idx = txt.indexOf(marker);
  let txtTitle = 'N/A';
  let txtStatus = 'N/A';
  let txtDate = 'N/A';
  let txtCat = 'N/A';
  let txtSlug = 'N/A';

  if (idx !== -1) {
    const lineStart = txt.lastIndexOf('[', idx);
    const lineEnd = txt.indexOf('\n', lineStart);
    const titleLine = txt.substring(lineStart, lineEnd).replace(/\[\d+\]\s*/, '').trim();
    txtTitle = titleLine;

    const block = txt.substring(idx, idx + 400);
    const mCat = block.match(/• Categoria:\s*([^\r\n]+)/);
    const mStatus = block.match(/• Status Editorial:\s*([^\r\n]+)/);
    const mDate = block.match(/• Data \/ Agendamento:\s*([^\r\n]+)/);
    const mLink = block.match(/• Link Oficial:\s*([^\r\n]+)/);

    if (mCat) txtCat = mCat[1].trim();
    if (mStatus) txtStatus = mStatus[1].trim();
    if (mDate) txtDate = mDate[1].trim();
    if (mLink) txtSlug = mLink[1].trim().split('post=')[1] || mLink[1].trim();
  }

  return {
    id,
    cache: {
      title: c ? c.title : null,
      slug: c ? c.slug : null,
      category: c ? c.category : null,
      created_at: c ? c.created_at : null,
      is_published: c ? c.is_published : null
    },
    seed: {
      title: s ? s.title : null,
      slug: s ? s.slug : null,
      category: s ? s.category : null,
      created_at: s ? s.created_at : null,
      is_published: s ? s.is_published : null
    },
    txt: {
      title: txtTitle,
      slug: txtSlug,
      category: txtCat,
      created_at: txtDate,
      status: txtStatus
    }
  };
});

fs.writeFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/scripts/target_ids_comparison.json', JSON.stringify(results, null, 2), 'utf8');
console.log('Saved comparison to scripts/target_ids_comparison.json');
