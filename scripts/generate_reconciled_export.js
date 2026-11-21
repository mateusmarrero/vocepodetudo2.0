const fs = require('fs');

const cache = JSON.parse(fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/api/cache_blog.json', 'utf8'));
const now = new Date('2026-11-14T21:18:00-03:00');

// Ordenar estritamente de 1 a 144 por ID
const sorted = [...cache].sort((a,b) => a.id - b.id);

const reconciled = sorted.map(p => {
  const dt = new Date(p.created_at.replace(' ', 'T') + '-03:00');
  const isPublished = (dt <= now) && (p.is_published === 1 || p.is_published === '1' || p.is_published === true);
  
  // Extrair tags / palavra-chave principal
  let tagsArr = [];
  if (Array.isArray(p.tags)) {
    tagsArr = p.tags;
  } else if (typeof p.tags === 'string' && p.tags.trim()) {
    tagsArr = p.tags.split(',').map(t => t.trim());
  }
  const primaryKw = tagsArr.length > 0 ? tagsArr[0] : p.title.split(':')[0].trim();

  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    category: p.category,
    status: isPublished ? 'Publicado' : 'Agendado',
    created_at: p.created_at,
    primary_keyword: primaryKw,
    canonical_url: `https://vocepodetudo.com/artigo/${p.slug}`,
    word_count: p.content ? p.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').length : 0
  };
});

fs.writeFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/scripts/reconciled_144_dataset.json', JSON.stringify(reconciled, null, 2), 'utf8');

console.log('Reconciled dataset generated successfully!');
console.log('Total:', reconciled.length);
console.log('Published:', reconciled.filter(r => r.status === 'Publicado').length);
console.log('Scheduled:', reconciled.filter(r => r.status === 'Agendado').length);
