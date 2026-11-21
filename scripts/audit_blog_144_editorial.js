const fs = require('fs');
const path = require('path');

const ROOT = 'C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY';
const posts = JSON.parse(fs.readFileSync(path.join(ROOT, 'api/cache_blog.json'), 'utf8'));

console.log('====================================================');
console.log('AUDITORIA EDITORIAL COMPLETA: 144 ARTIGOS DO BLOG');
console.log('====================================================\n');

// 1. Tags mais frequentes
const tagCounts = {};
posts.forEach(p => {
  let tags = [];
  if (Array.isArray(p.tags)) {
    tags = p.tags.map(t => String(t).trim().toLowerCase()).filter(Boolean);
  } else if (typeof p.tags === 'string') {
    tags = p.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
  }
  tags.forEach(t => {
    tagCounts[t] = (tagCounts[t] || 0) + 1;
  });
});

const sortedTags = Object.entries(tagCounts).sort((a,b) => b[1] - a[1]);
console.log('📌 TOP 20 TAGS MAIS RECORRENTES:');
sortedTags.slice(0, 20).forEach(([t, c]) => {
  console.log(`  - ${t}: ${c} artigos`);
});

// 2. Análise de Palavras-Chave nos Títulos (Detecção de Canibalização / Sobreposição)
const stopwords = new Set([
  'como', 'para', 'com', 'sem', 'mais', 'guia', 'completo', 'dicas', 'passo', 'melhores',
  'sobre', 'qual', 'quando', 'onde', 'porque', 'fazer', 'voce', 'sua', 'seu', 'suas', 'seus'
]);

const wordClusters = {};
posts.forEach(p => {
  const words = p.title.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopwords.has(w));

  words.forEach(w => {
    if (!wordClusters[w]) wordClusters[w] = [];
    wordClusters[w].push({ id: p.id, title: p.title, slug: p.slug, category: p.category });
  });
});

const topClusters = Object.entries(wordClusters)
  .filter(([w, list]) => list.length >= 5)
  .sort((a, b) => b[1].length - a[1].length);

console.log('\n🔍 CONCENTRAÇÃO TEMÁTICA NOS TÍTULOS (TOP CLUSTERS):');
topClusters.forEach(([word, list]) => {
  console.log(`  - '${word}': ${list.length} artigos`);
});

// 3. Auditoria de Divergência entre Título e Slug
console.log('\n⚠️ AUDITORIA DE COERÊNCIA ENTRE SLUG E TÍTULO:');
const slugDivergences = [];
posts.forEach(p => {
  const slugWords = p.slug.split('-').filter(w => w.length > 3);
  const titleNorm = p.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  let matchCount = 0;
  slugWords.forEach(sw => {
    if (titleNorm.includes(sw)) matchCount++;
  });
  const matchRatio = matchCount / (slugWords.length || 1);
  if (matchRatio < 0.4) {
    slugDivergences.push({ id: p.id, title: p.title, slug: p.slug, ratio: matchRatio.toFixed(2) });
  }
});

console.log(`Total com baixa correlação slug/título: ${slugDivergences.length}`);
slugDivergences.forEach(d => {
  console.log(`  [ID ${d.id}] Slug: ${d.slug} | Título: ${d.title} (Match: ${d.ratio})`);
});

// 4. Salvar inventário detalhado em scratch para consulta permanente
const reportData = {
  total: posts.length,
  clusters: topClusters.map(([w, l]) => ({ keyword: w, count: l.length, articles: l.map(a => a.title) })),
  slugDivergences,
  allTitles: posts.map((p, idx) => ({
    num: idx + 1,
    id: p.id,
    title: p.title,
    slug: p.slug,
    category: p.category,
    date: p.created_at,
    status: (new Date(p.created_at) > new Date()) ? 'Agendado' : 'Publicado',
    tags: p.tags
  }))
};

fs.writeFileSync(path.join(ROOT, 'scripts/editorial_inventory_analysis.json'), JSON.stringify(reportData, null, 2), 'utf8');
console.log('\n✅ Análise detalhada salva em scripts/editorial_inventory_analysis.json');
